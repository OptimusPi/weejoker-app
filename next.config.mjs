import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// This initializes the dev server to be able to use Cloudflare bindings.
// Wrapped in try-catch because dotnet.native.wasm (28MB) exceeds the 25MB
// Cloudflare Workers asset limit, causing an unhandled rejection that crashes
// the dev server. The API route has its own dev fallbacks for seed data.
try {
  initOpenNextCloudflareForDev();
} catch (e) {
  console.warn('[next.config] initOpenNextCloudflareForDev failed:', e?.message || e);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config
  // The `initOpenNextCloudflareForDev` call will handle the rest

  // Add headers for WASM support
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // Add WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // motely-wasm's Bootsharp bundle contains `/*! webpackIgnore: true */`
    // magic comments that Next.js webpack can't parse. Suppress these warnings.
    config.module.rules.push({
      test: /node_modules[\\/]motely-wasm[\\/]index\.mjs$/,
      parser: { javascript: { importMeta: false } },
    });
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /motely-wasm/ },
    ];

    // Fallback for node modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Server: don't try to bundle motely-wasm (it's browser-only WASM)
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('motely-wasm');
      }
    }

    return config;
  },
};

export default nextConfig;
