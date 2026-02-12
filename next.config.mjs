import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import withMotelyWasm from "motely-wasm/next-plugin";

if (process.env.NODE_ENV === 'development') {
    await setupDevPlatform({
        persist: true,
    });
}

const baseConfig = {
    allowedDevOrigins: [
        'http://localhost:3000',
        'http://192.168.0.171:3000',
        'https://*.seed-finder-app.pages.dev'
    ]
};

export default withMotelyWasm(baseConfig);




