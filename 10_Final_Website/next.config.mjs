/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Off for shipped builds. `PROFILE_SOURCEMAPS=true npm run build` turns maps
  // on so `scripts/profile-main-thread.mjs` can attribute sampled CPU time to
  // original modules instead of minified chunk offsets. Emitting maps appends a
  // `sourceMappingURL` comment and writes sibling .map files; the JS itself is
  // byte-identical and browsers never fetch the maps unless devtools is open,
  // so a profiling build measures the same code the production build ships.
  productionBrowserSourceMaps: process.env.PROFILE_SOURCEMAPS === 'true',
  // No `eslint` key. Next 16 removed built-in linting from `next build` and
  // reports the key as an unrecognized option. ESLint remains a separate CI
  // gate via `npm run lint` / `npm run preflight`.
  // TypeScript type errors from @react-three/fiber@8 types vs React 19 types are suppressed.
  // The JS runtime is correct; these are type-definition gaps in R3F 8 that R3F 9 resolves.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'prod.spline.design' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // No `webpack()` override. Next 16 runs Turbopack by default, and a webpack
  // config with no matching turbopack config is a hard build error. Both rules
  // that used to live here were webpack-specific and are no longer needed:
  //
  //   • a raw-loader rule for .glsl/.vs/.fs/.vert/.frag — the project contains
  //     no shader files of any kind, so the rule never matched anything.
  //   • a `resolve.conditionNames` patch admitting 'import'/'default' for the
  //     ESM-only @splinetool/react-spline — that worked around webpack's
  //     resolver. Turbopack honours the `exports` `import` condition natively,
  //     and `transpilePackages` below remains the actual load-bearing mechanism.
  //
  // Route the Spline packages through Next's loader chain so the
  // ESM-only sources are normalised for both server and client bundles.
  // Combined with `ssr: false` on the dynamic import in SplineScene.tsx,
  // runtime behaviour is unchanged: still lazy, still client-only.
  transpilePackages: ['@splinetool/react-spline', '@splinetool/runtime'],
  experimental: {
    optimizePackageImports: [
      'three',
      '@react-three/drei',
      '@react-three/fiber',
      'framer-motion',
      'lucide-react',
    ],
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
    ];
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

// Optional bundle analyzer — run with `ANALYZE=true npm run build`
const withBundleAnalyzerMaybe = async (cfg) => {
  if (process.env.ANALYZE !== 'true') return cfg;
  try {
    const mod = await import('@next/bundle-analyzer');
    return mod.default({ enabled: true })(cfg);
  } catch {
    // analyzer not installed — silently no-op so devs without it can still build
    return cfg;
  }
};

export default await withBundleAnalyzerMaybe(nextConfig);
