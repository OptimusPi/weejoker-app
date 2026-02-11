import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

if (process.env.NODE_ENV === 'development') {
    await setupDevPlatform({
        persist: true,
    });
}

const baseConfig = {
    allowedDevOrigins: [
        'localhost',
        'weejoker.app',
        'www.weejoker.app',
        '192.168.0.171'
    ],
    typescript: {
        ignoreBuildErrors: true,
    },
    // Exclude motely-wasm from SSR bundling - it's browser-only
    serverExternalPackages: ['motely-wasm'],
    // Turbopack config to skip analyzing motely-wasm's dynamic dotnet.js import
    turbopack: {
        resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    },
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
};

export default baseConfig;




