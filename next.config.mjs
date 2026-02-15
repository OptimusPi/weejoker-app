import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import withMotelyWasm from "motely-wasm/next-plugin";

initOpenNextCloudflareForDev();

const baseConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
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

export default withMotelyWasm(baseConfig);




