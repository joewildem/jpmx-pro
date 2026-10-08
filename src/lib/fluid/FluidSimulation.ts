// Adapted from three-fluid-sim by Andrés Valencia Téllez (MIT).
// Original project: https://github.com/amsXYZ/three-fluid-sim
// See ./LICENSE for the upstream license.
import {
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  HalfFloatType,
  LinearFilter,
  Mesh,
  NoBlending,
  NoToneMapping,
  OrthographicCamera,
  RawShaderMaterial,
  RGBAFormat,
  Scene,
  Sphere,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';

const VERTEX_SHADER = `
  precision highp float;
  attribute vec2 position;
  varying vec2 vUV;

  void main() {
    vUV = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const quad = new BufferGeometry();
quad.setAttribute(
  'position',
  new BufferAttribute(new Float32Array([-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]), 2),
);
quad.boundingSphere = new Sphere(new Vector3(), Math.SQRT2);

type UniformValues = Record<string, unknown>;

function createPass(fragmentShader: string, uniforms: UniformValues) {
  const material = new RawShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader,
    uniforms: Object.fromEntries(Object.entries(uniforms).map(([key, value]) => [key, { value }])),
    depthTest: false,
    depthWrite: false,
    blending: NoBlending,
    transparent: false,
  });
  const scene = new Scene();
  const mesh = new Mesh(quad, material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return { scene, material };
}

function makeTarget(width: number, height: number) {
  return new WebGLRenderTarget(width, height, {
    format: RGBAFormat,
    type: HalfFloatType,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

class DoubleTarget {
  read: WebGLRenderTarget;
  write: WebGLRenderTarget;

  constructor(width: number, height: number) {
    this.read = makeTarget(width, height);
    this.write = makeTarget(width, height);
  }

  swap() {
    [this.read, this.write] = [this.write, this.read];
  }

  resize(width: number, height: number) {
    this.read.setSize(width, height);
    this.write.setSize(width, height);
  }

  dispose() {
    this.read.dispose();
    this.write.dispose();
  }
}

const ADVECTION_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D source;
  uniform sampler2D velocity;
  uniform float timeDelta;
  uniform float decay;

  void main() {
    vec2 previous = clamp(vUV - timeDelta * texture2D(velocity, vUV).xy, 0.001, 0.999);
    gl_FragColor = texture2D(source, previous) * (1.0 - decay);
  }
`;

const SPLAT_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D source;
  uniform vec4 pointer;
  uniform vec2 aspect;
  uniform float radius;
  uniform float force;
  uniform float isDye;

  void main() {
    vec2 scaledUV = (vUV - 0.5) * aspect + aspect * 0.5;
    vec2 delta = scaledUV - pointer.xy;
    float influence = exp(-dot(delta, delta) / max(radius * radius, 0.0001));
    vec4 current = texture2D(source, vUV);
    vec2 impulse = pointer.zw * influence * force;
    vec2 addition = mix(impulse, vec2(length(pointer.zw) * influence * force * 0.42), isDye);
    gl_FragColor = current + vec4(addition, 0.0, 0.0);
  }
`;

const DIVERGENCE_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D velocity;
  uniform vec2 texelSize;

  void main() {
    float left = texture2D(velocity, vUV - vec2(texelSize.x, 0.0)).x;
    float right = texture2D(velocity, vUV + vec2(texelSize.x, 0.0)).x;
    float bottom = texture2D(velocity, vUV - vec2(0.0, texelSize.y)).y;
    float top = texture2D(velocity, vUV + vec2(0.0, texelSize.y)).y;
    gl_FragColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);
  }
`;

const PRESSURE_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D pressure;
  uniform sampler2D divergence;
  uniform vec2 texelSize;

  void main() {
    float left = texture2D(pressure, vUV - vec2(texelSize.x, 0.0)).r;
    float right = texture2D(pressure, vUV + vec2(texelSize.x, 0.0)).r;
    float bottom = texture2D(pressure, vUV - vec2(0.0, texelSize.y)).r;
    float top = texture2D(pressure, vUV + vec2(0.0, texelSize.y)).r;
    float div = texture2D(divergence, vUV).r;
    gl_FragColor = vec4((left + right + bottom + top - div) * 0.25, 0.0, 0.0, 1.0);
  }
`;

const GRADIENT_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D velocity;
  uniform sampler2D pressure;
  uniform vec2 texelSize;

  void main() {
    float left = texture2D(pressure, vUV - vec2(texelSize.x, 0.0)).r;
    float right = texture2D(pressure, vUV + vec2(texelSize.x, 0.0)).r;
    float bottom = texture2D(pressure, vUV - vec2(0.0, texelSize.y)).r;
    float top = texture2D(pressure, vUV + vec2(0.0, texelSize.y)).r;
    vec2 value = texture2D(velocity, vUV).xy - 0.5 * vec2(right - left, top - bottom);
    gl_FragColor = vec4(value, 0.0, 1.0);
  }
`;

const LUMINANCE_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D colorBuffer;

  void main() {
    vec3 color = abs(texture2D(colorBuffer, vUV).rgb);
    float luminance = dot(color, vec3(0.2125, 0.7154, 0.0721));
    float light = smoothstep(0.001, 0.09, luminance);
    gl_FragColor = vec4(vec3(light), light * 0.5);
  }
`;

export class FluidSimulation {
  private renderer: WebGLRenderer;
  private camera = new OrthographicCamera();
  private velocity: DoubleTarget;
  private color: DoubleTarget;
  private pressure: DoubleTarget;
  private divergence: WebGLRenderTarget;
  private resolution = new Vector2();
  private aspect = new Vector2();
  private pointer = new Vector4();
  private previousPointer = new Vector2();
  private hasPointer = false;
  private hasSplat = false;
  private frame = 0;
  private lastInput = 0;
  private disposed = false;

  private advection = createPass(ADVECTION_SHADER, {
    source: null,
    velocity: null,
    timeDelta: 1 / 60,
    decay: 0,
  });
  private splat = createPass(SPLAT_SHADER, {
    source: null,
    pointer: this.pointer,
    aspect: this.aspect,
    radius: 0.075,
    force: 2.2,
    isDye: 0,
  });
  private divergencePass = createPass(DIVERGENCE_SHADER, {
    velocity: null,
    texelSize: new Vector2(),
  });
  private pressurePass = createPass(PRESSURE_SHADER, {
    pressure: null,
    divergence: null,
    texelSize: new Vector2(),
  });
  private gradient = createPass(GRADIENT_SHADER, {
    velocity: null,
    pressure: null,
    texelSize: new Vector2(),
  });
  private composition = createPass(LUMINANCE_SHADER, { colorBuffer: null });

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.autoClear = true;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.toneMapping = NoToneMapping;

    const context = this.renderer.getContext();
    if (!context.getExtension('EXT_color_buffer_float')) {
      throw new Error('Floating-point render targets are not available.');
    }

    const { width, height } = this.getSimulationSize();
    this.velocity = new DoubleTarget(width, height);
    this.color = new DoubleTarget(width, height);
    this.pressure = new DoubleTarget(width, height);
    this.divergence = makeTarget(width, height);
    this.resize();
    this.clearTargets();
  }

  move(clientX: number, clientY: number) {
    const normalizedX = clientX / Math.max(window.innerWidth, 1);
    const normalizedY = 1 - clientY / Math.max(window.innerHeight, 1);
    const x = normalizedX * this.aspect.x;
    const y = normalizedY;

    if (!this.hasPointer) {
      this.previousPointer.set(x, y);
      this.hasPointer = true;
      return;
    }

    const dx = x - this.previousPointer.x;
    const dy = y - this.previousPointer.y;
    this.previousPointer.set(x, y);
    if (Math.hypot(dx, dy) < 0.00025) return;

    this.pointer.set(x, y, dx, dy);
    this.hasSplat = true;
    this.lastInput = performance.now();
    this.canvas.classList.add('is-active');
    this.start();
  }

  resize = () => {
    if (this.disposed) return;
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    const { width, height } = this.getSimulationSize();
    this.resolution.set(width, height);
    this.aspect.set(width / height, 1);
    this.velocity.resize(width, height);
    this.color.resize(width, height);
    this.pressure.resize(width, height);
    this.divergence.setSize(width, height);
    const texelSize = new Vector2(1 / width, 1 / height);
    this.divergencePass.material.uniforms.texelSize.value.copy(texelSize);
    this.pressurePass.material.uniforms.texelSize.value.copy(texelSize);
    this.gradient.material.uniforms.texelSize.value.copy(texelSize);
  };

  start() {
    if (this.frame || this.disposed || document.hidden) return;
    this.frame = requestAnimationFrame(this.render);
  }

  stop = () => {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  };

  resetPointer = () => {
    this.hasPointer = false;
  };

  dispose() {
    this.disposed = true;
    this.stop();
    this.velocity.dispose();
    this.color.dispose();
    this.pressure.dispose();
    this.divergence.dispose();
    this.renderer.dispose();
  }

  private getSimulationSize() {
    const scale = Math.min(0.42, 720 / Math.max(window.innerWidth, 1), 460 / Math.max(window.innerHeight, 1));
    return {
      width: Math.max(2, Math.round(window.innerWidth * scale)),
      height: Math.max(2, Math.round(window.innerHeight * scale)),
    };
  }

  private clear(target: WebGLRenderTarget) {
    this.renderer.setRenderTarget(target);
    this.renderer.clear(true, false, false);
  }

  private clearTargets() {
    [
      this.velocity.read,
      this.velocity.write,
      this.color.read,
      this.color.write,
      this.pressure.read,
      this.pressure.write,
      this.divergence,
    ].forEach((target) => this.clear(target));
    this.renderer.setRenderTarget(null);
  }

  private draw(pass: ReturnType<typeof createPass>, target: WebGLRenderTarget | null) {
    this.renderer.setRenderTarget(target);
    this.renderer.render(pass.scene, this.camera);
  }

  private render = () => {
    this.frame = 0;
    if (this.disposed || document.hidden) return;

    const velocityUniforms = this.advection.material.uniforms;
    velocityUniforms.source.value = this.velocity.read.texture;
    velocityUniforms.velocity.value = this.velocity.read.texture;
    velocityUniforms.decay.value = 0.006;
    this.draw(this.advection, this.velocity.write);
    this.velocity.swap();

    if (this.hasSplat) {
      const splatUniforms = this.splat.material.uniforms;
      splatUniforms.source.value = this.velocity.read.texture;
      splatUniforms.isDye.value = 0;
      splatUniforms.force.value = 2.2;
      this.draw(this.splat, this.velocity.write);
      this.velocity.swap();
    }

    this.divergencePass.material.uniforms.velocity.value = this.velocity.read.texture;
    this.draw(this.divergencePass, this.divergence);

    for (let iteration = 0; iteration < 18; iteration += 1) {
      this.pressurePass.material.uniforms.pressure.value = this.pressure.read.texture;
      this.pressurePass.material.uniforms.divergence.value = this.divergence.texture;
      this.draw(this.pressurePass, this.pressure.write);
      this.pressure.swap();
    }

    this.gradient.material.uniforms.velocity.value = this.velocity.read.texture;
    this.gradient.material.uniforms.pressure.value = this.pressure.read.texture;
    this.draw(this.gradient, this.velocity.write);
    this.velocity.swap();

    velocityUniforms.source.value = this.color.read.texture;
    velocityUniforms.velocity.value = this.velocity.read.texture;
    velocityUniforms.decay.value = 0.018;
    this.draw(this.advection, this.color.write);
    this.color.swap();

    if (this.hasSplat) {
      const splatUniforms = this.splat.material.uniforms;
      splatUniforms.source.value = this.color.read.texture;
      splatUniforms.isDye.value = 1;
      splatUniforms.force.value = 1.7;
      this.draw(this.splat, this.color.write);
      this.color.swap();
      this.hasSplat = false;
    }

    this.composition.material.uniforms.colorBuffer.value = this.color.read.texture;
    this.draw(this.composition, null);

    if (performance.now() - this.lastInput < 6500) {
      this.frame = requestAnimationFrame(this.render);
    } else {
      this.canvas.classList.remove('is-active');
    }
  };
}
