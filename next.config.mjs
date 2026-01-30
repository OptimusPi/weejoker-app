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
        '127.0.0.1',
        '0.0.0.0',
        '192.168.0.171',
        'motelyjaml-pi.8pi.me',
        'motelyjaml-pi.8pi.me:3141'
    ],
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
