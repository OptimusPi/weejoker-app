/** @type {import('next').NextConfig} */
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

if (process.env.NODE_ENV === 'development') {
    await setupDevPlatform({
        persist: true,
    });
}

const nextConfig = {
    experimental: {
        turbo: {
            root: '.',
        },
    },
};

export default nextConfig;
