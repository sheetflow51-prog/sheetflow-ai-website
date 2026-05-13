/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'prod.spline.design' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader'],
    });
    // `@splinetool/react-spline` is ESM-only and its `exports` field
    // declares only `types` + `import` (no `default`/`require`/`node`).
    // Next 15's webpack resolver, in some passes, evaluates conditions
    // that exclude `import` and the resolution errors with
    // "Package path . is not exported". Explicitly admitting `import`
    // (plus `default` as a defensive fallback) makes the resolver
    // accept the ESM entry without changing how the package is consumed.
    config.resolve = config.resolve ?? {};
    config.resolve.conditionNames = Array.from(
      new Set([...(config.resolve.conditionNames ?? []), 'import', 'default']),
    );
    return config;
  },
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
