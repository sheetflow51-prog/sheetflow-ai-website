/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  // ESLint runs as a separate CI gate — not during the build pipeline.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Next.js 16 enables Turbopack by default for production builds.
  // Declaring an empty turbopack config acknowledges this and prevents
  // the hard error caused by having a webpack config with no turbopack config.
  turbopack: {},
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
    config.resolve = config.resolve ?? {};
    config.resolve.conditionNames = Array.from(
      new Set([...(config.resolve.conditionNames ?? []), 'import', 'default']),
    );
    return config;
  },
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
    return cfg;
  }
};

export default await withBundleAnalyzerMaybe(nextConfig);
