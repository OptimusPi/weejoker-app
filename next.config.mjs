import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

if (process.env.NODE_ENV === 'development') {
    initOpenNextCloudflareForDev();
}

const baseConfig = {};

export default baseConfig;
