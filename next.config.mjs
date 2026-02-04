/** @type {import('next').NextConfig} */
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

if (process.env.NODE_ENV === 'development') {
    await setupDevPlatform({
        persist: true,
    });
}

const nextConfig = {
    allowedDevOrigins: [
        'localhost',
        'weejoker.app',
        'www.weejoker.app',
        '192.168.0.171'
    ],
    typescript: {
        ignoreBuildErrors: true,
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
                    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
                ],
            },
        ];
    },
};

export default nextConfig;
