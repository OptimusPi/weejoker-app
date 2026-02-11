import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

if (process.env.NODE_ENV === 'development') {
    await setupDevPlatform({
        persist: true,
    });
}

import fs from 'fs';
import path from 'path';

// Read motely-wasm version from its package.json
let motelyVersion = 'unknown';
try {
    const motelyPackageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'node_modules', 'motely-wasm', 'package.json'), 'utf8'));
    motelyVersion = motelyPackageJson.version;
} catch (e) {
    console.warn('Failed to read motely-wasm version:', e);
}

const baseConfig = {
    env: {
        MOTELY_WASM_VERSION: motelyVersion,
    },
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




