// Adapted from WebGL Fluid Simulation by Pavel Dobryakov (MIT).
// Original project: https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
// See ./LICENSE for the upstream license.
import {
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  Color,
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

const SIMULATION = {
  quality: 'high',
  simResolution: 128,
  dyeResolution: 1024,
  densityDissipation: 2.7,
  velocityDissipation: 4,
  pressure: 0.44,
  pressureIterations: 20,
  curl: 0,
  splatRadius: 0.23,
  splatForce: 6000,
  shading: false,
  colorful: true,
  paused: false,
  bloom: true,
  bloomResolution: 256,
  bloomIntensity: 0.8,
  bloomThreshold: 0.8,
  sunrays: true,
  sunraysResolution: 196,
  sunraysWeight: 1,
} as const;

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
  uniform vec2 velocityTexelSize;

  void main() {
    vec2 previous = clamp(vUV - timeDelta * texture2D(velocity, vUV).xy * velocityTexelSize, 0.001, 0.999);
    gl_FragColor = texture2D(source, previous) / (1.0 + decay * timeDelta);
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
  uniform vec3 splatColor;

  void main() {
    vec2 scaledUV = (vUV - 0.5) * aspect + aspect * 0.5;
    vec2 delta = scaledUV - pointer.xy;
    float influence = exp(-dot(delta, delta) / max(radius * radius, 0.0001));
    vec4 current = texture2D(source, vUV);
    vec3 impulse = vec3(pointer.zw * influence * force, 0.0);
    vec3 addition = mix(impulse, splatColor * influence, isDye);
    gl_FragColor = current + vec4(addition, 0.0);
  }
`;

const CLEAR_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D source;
  uniform float value;

  void main() {
    gl_FragColor = texture2D(source, vUV) * value;
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

const BLOOM_PREFILTER_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D source;
  uniform float threshold;

  void main() {
    vec3 color = texture2D(source, vUV).rgb;
    float brightness = max(color.r, max(color.g, color.b));
    float contribution = max(brightness - threshold, 0.0) / max(brightness, 0.0001);
    gl_FragColor = vec4(color * contribution, 1.0);
  }
`;

const BLUR_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D source;
  uniform vec2 direction;

  void main() {
    vec3 color = texture2D(source, vUV).rgb * 0.29411764;
    color += texture2D(source, vUV - direction * 1.33333333).rgb * 0.35294117;
    color += texture2D(source, vUV + direction * 1.33333333).rgb * 0.35294117;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const SUNRAYS_MASK_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D source;

  void main() {
    vec3 color = texture2D(source, vUV).rgb;
    float brightness = max(color.r, max(color.g, color.b));
    float mask = 1.0 - min(max(brightness * 20.0, 0.0), 0.8);
    gl_FragColor = vec4(mask, 0.0, 0.0, 1.0);
  }
`;

const SUNRAYS_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D source;
  uniform float weight;

  void main() {
    vec2 coordinate = vUV;
    vec2 direction = (vUV - 0.5) * (0.3 / 16.0);
    float illuminationDecay = 1.0;
    float ray = texture2D(source, vUV).r;
    for (int i = 0; i < 16; i++) {
      coordinate -= direction;
      ray += texture2D(source, coordinate).r * illuminationDecay * weight;
      illuminationDecay *= 0.95;
    }
    gl_FragColor = vec4(ray * 0.7, 0.0, 0.0, 1.0);
  }
`;

const DISPLAY_SHADER = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D colorBuffer;
  uniform sampler2D bloomBuffer;
  uniform sampler2D sunraysBuffer;
  uniform float bloomIntensity;

  vec3 linearToGamma(vec3 color) {
    color = max(color, vec3(0.0));
    return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0.0));
  }

  void main() {
    vec3 color = texture2D(colorBuffer, vUV).rgb;
    vec3 bloom = linearToGamma(texture2D(bloomBuffer, vUV).rgb) * bloomIntensity;
    float sunrays = texture2D(sunraysBuffer, vUV).r;
    color = (color + bloom) * sunrays;
    float alpha = clamp(max(color.r, max(color.g, color.b)), 0.0, 0.72);
    gl_FragColor = vec4(color, alpha);
  }
`;

export class FluidSimulation {
  private renderer: WebGLRenderer;
  private camera = new OrthographicCamera();
  private velocity: DoubleTarget;
  private color: DoubleTarget;
  private pressure: DoubleTarget;
  private divergence: WebGLRenderTarget;
  private bloom: WebGLRenderTarget;
  private bloomTemp: WebGLRenderTarget;
  private sunrays: WebGLRenderTarget;
  private sunraysTemp: WebGLRenderTarget;
  private resolution = new Vector2();
  private aspect = new Vector2();
  private pointer = new Vector4();
  private splatColor = new Color();
  private previousPointer = new Vector2();
  private hasPointer = false;
  private hasSplat = false;
  private frame = 0;
  private lastInput = 0;
  private lastFrame = performance.now();
  private disposed = false;

  private advection = createPass(ADVECTION_SHADER, {
    source: null,
    velocity: null,
    timeDelta: 1 / 60,
    decay: 0,
    velocityTexelSize: new Vector2(),
  });
  private splat = createPass(SPLAT_SHADER, {
    source: null,
    pointer: this.pointer,
    aspect: this.aspect,
    radius: 0.05,
    force: SIMULATION.splatForce,
    isDye: 0,
    splatColor: this.splatColor,
  });
  private clearPass = createPass(CLEAR_SHADER, { source: null, value: SIMULATION.pressure });
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
  private bloomPrefilter = createPass(BLOOM_PREFILTER_SHADER, {
    source: null,
    threshold: SIMULATION.bloomThreshold,
  });
  private blur = createPass(BLUR_SHADER, { source: null, direction: new Vector2() });
  private sunraysMask = createPass(SUNRAYS_MASK_SHADER, { source: null });
  private sunraysPass = createPass(SUNRAYS_SHADER, {
    source: null,
    weight: SIMULATION.sunraysWeight,
  });
  private composition = createPass(DISPLAY_SHADER, {
    colorBuffer: null,
    bloomBuffer: null,
    sunraysBuffer: null,
    bloomIntensity: SIMULATION.bloomIntensity,
  });

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

    const { width, height } = this.getResolution(SIMULATION.simResolution);
    const dyeSize = this.getResolution(SIMULATION.dyeResolution);
    const bloomSize = this.getResolution(SIMULATION.bloomResolution);
    const sunraysSize = this.getResolution(SIMULATION.sunraysResolution);
    this.velocity = new DoubleTarget(width, height);
    this.color = new DoubleTarget(dyeSize.width, dyeSize.height);
    this.pressure = new DoubleTarget(width, height);
    this.divergence = makeTarget(width, height);
    this.bloom = makeTarget(bloomSize.width, bloomSize.height);
    this.bloomTemp = makeTarget(bloomSize.width, bloomSize.height);
    this.sunrays = makeTarget(sunraysSize.width, sunraysSize.height);
    this.sunraysTemp = makeTarget(sunraysSize.width, sunraysSize.height);
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
    this.splatColor.setHSL((performance.now() * 0.0001) % 1, 1, 0.5).multiplyScalar(0.15);
    this.hasSplat = true;
    this.lastInput = performance.now();
    this.canvas.classList.add('is-active');
    this.start();
  }

  resize = () => {
    if (this.disposed) return;
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    const { width, height } = this.getResolution(SIMULATION.simResolution);
    const dyeSize = this.getResolution(SIMULATION.dyeResolution);
    const bloomSize = this.getResolution(SIMULATION.bloomResolution);
    const sunraysSize = this.getResolution(SIMULATION.sunraysResolution);
    this.resolution.set(width, height);
    this.aspect.set(window.innerWidth / Math.max(window.innerHeight, 1), 1);
    this.velocity.resize(width, height);
    this.color.resize(dyeSize.width, dyeSize.height);
    this.pressure.resize(width, height);
    this.divergence.setSize(width, height);
    this.bloom.setSize(bloomSize.width, bloomSize.height);
    this.bloomTemp.setSize(bloomSize.width, bloomSize.height);
    this.sunrays.setSize(sunraysSize.width, sunraysSize.height);
    this.sunraysTemp.setSize(sunraysSize.width, sunraysSize.height);
    const texelSize = new Vector2(1 / width, 1 / height);
    this.advection.material.uniforms.velocityTexelSize.value.copy(texelSize);
    this.divergencePass.material.uniforms.texelSize.value.copy(texelSize);
    this.pressurePass.material.uniforms.texelSize.value.copy(texelSize);
    this.gradient.material.uniforms.texelSize.value.copy(texelSize);
    this.splat.material.uniforms.radius.value = Math.sqrt((SIMULATION.splatRadius / 100) * Math.max(this.aspect.x, 1));
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
    this.bloom.dispose();
    this.bloomTemp.dispose();
    this.sunrays.dispose();
    this.sunraysTemp.dispose();
    this.renderer.dispose();
  }

  private getResolution(shortSide: number) {
    const aspect = Math.max(window.innerWidth, window.innerHeight) / Math.max(Math.min(window.innerWidth, window.innerHeight), 1);
    return window.innerWidth > window.innerHeight
      ? { width: Math.round(shortSide * aspect), height: shortSide }
      : { width: shortSide, height: Math.round(shortSide * aspect) };
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
      this.bloom,
      this.bloomTemp,
      this.sunrays,
      this.sunraysTemp,
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

    const now = performance.now();
    const timeDelta = Math.min((now - this.lastFrame) / 1000, 1 / 60);
    this.lastFrame = now;

    const velocityUniforms = this.advection.material.uniforms;
    velocityUniforms.source.value = this.velocity.read.texture;
    velocityUniforms.velocity.value = this.velocity.read.texture;
    velocityUniforms.timeDelta.value = timeDelta;
    velocityUniforms.decay.value = SIMULATION.velocityDissipation;
    this.draw(this.advection, this.velocity.write);
    this.velocity.swap();

    if (this.hasSplat) {
      const splatUniforms = this.splat.material.uniforms;
      splatUniforms.source.value = this.velocity.read.texture;
      splatUniforms.isDye.value = 0;
      splatUniforms.force.value = SIMULATION.splatForce;
      this.draw(this.splat, this.velocity.write);
      this.velocity.swap();
    }

    this.divergencePass.material.uniforms.velocity.value = this.velocity.read.texture;
    this.draw(this.divergencePass, this.divergence);

    this.clearPass.material.uniforms.source.value = this.pressure.read.texture;
    this.draw(this.clearPass, this.pressure.write);
    this.pressure.swap();

    for (let iteration = 0; iteration < SIMULATION.pressureIterations; iteration += 1) {
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
    velocityUniforms.decay.value = SIMULATION.densityDissipation;
    this.draw(this.advection, this.color.write);
    this.color.swap();

    if (this.hasSplat) {
      const splatUniforms = this.splat.material.uniforms;
      splatUniforms.source.value = this.color.read.texture;
      splatUniforms.isDye.value = 1;
      splatUniforms.force.value = 1;
      this.draw(this.splat, this.color.write);
      this.color.swap();
      this.hasSplat = false;
    }

    this.bloomPrefilter.material.uniforms.source.value = this.color.read.texture;
    this.draw(this.bloomPrefilter, this.bloom);
    for (let iteration = 0; iteration < 3; iteration += 1) {
      this.blur.material.uniforms.source.value = this.bloom.texture;
      this.blur.material.uniforms.direction.value.set(1 / this.bloom.width, 0);
      this.draw(this.blur, this.bloomTemp);
      this.blur.material.uniforms.source.value = this.bloomTemp.texture;
      this.blur.material.uniforms.direction.value.set(0, 1 / this.bloom.height);
      this.draw(this.blur, this.bloom);
    }

    this.sunraysMask.material.uniforms.source.value = this.color.read.texture;
    this.draw(this.sunraysMask, this.sunraysTemp);
    this.sunraysPass.material.uniforms.source.value = this.sunraysTemp.texture;
    this.draw(this.sunraysPass, this.sunrays);
    this.blur.material.uniforms.source.value = this.sunrays.texture;
    this.blur.material.uniforms.direction.value.set(1 / this.sunrays.width, 0);
    this.draw(this.blur, this.sunraysTemp);
    this.blur.material.uniforms.source.value = this.sunraysTemp.texture;
    this.blur.material.uniforms.direction.value.set(0, 1 / this.sunrays.height);
    this.draw(this.blur, this.sunrays);

    const compositionUniforms = this.composition.material.uniforms;
    compositionUniforms.colorBuffer.value = this.color.read.texture;
    compositionUniforms.bloomBuffer.value = this.bloom.texture;
    compositionUniforms.sunraysBuffer.value = this.sunrays.texture;
    this.draw(this.composition, null);

    if (now - this.lastInput < 6500) {
      this.frame = requestAnimationFrame(this.render);
    } else {
      this.canvas.classList.remove('is-active');
    }
  };
}
