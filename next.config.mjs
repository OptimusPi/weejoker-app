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
        'localhost:3000',
        '127.0.0.1:3000',
        '127.0.0.1',
        '0.0.0.0',
        '192.168.0.171',
        '192.168.0.171:3000',
        'motelyjaml-pi.8pi.me',
        'motelyjaml-pi.8pi.me:3141'
    ],
    typescript: {
        ignoreBuildErrors: true,
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-Requested-With, Content-Type, Authorization',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
