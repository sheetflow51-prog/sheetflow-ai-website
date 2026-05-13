/**
 * NoiseTexture — page-wide film grain overlay.
 * Uses an inline SVG fractalNoise filter (≈ no network cost) and
 * sits at z=1 above the ambient gradient but below all content.
 *
 * The grain breaks the perfect smoothness of dark surfaces — the same
 * trick Apple, Stripe, and Vercel use to make dark UIs feel "filmic"
 * rather than "flat".
 */
export default function NoiseTexture({ opacity = 0.035 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        backgroundSize: '200px 200px',
        opacity,
      }}
    />
  );
}
