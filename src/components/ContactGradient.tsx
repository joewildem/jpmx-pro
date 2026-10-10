import { GradFlow } from 'gradflow';

const config = {
  color1: { r: 6, g: 20, b: 12 },
  color2: { r: 0, g: 0, b: 0 },
  color3: { r: 33, g: 33, b: 33 },
  speed: 0.8,
  scale: 1,
  type: 'silk' as const,
  noise: 0.12,
};

export default function ContactGradient() {
  return (
    <div className="contact-gradient-host" aria-hidden="true">
      <GradFlow className="contact-gradient" config={config} />
    </div>
  );
}
