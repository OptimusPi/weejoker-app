import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import withMotelyWasm from 'motely-wasm/next-plugin';

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
    // Exclude motely-wasm from SSR bundling - it's browser-only
    serverExternalPackages: ['motely-wasm'],
};

export default withMotelyWasm(nextConfig);




