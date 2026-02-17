import { initOpenNextCloudflareForDev } from '@opennext/cloudflare';

// This initializes the dev server to be able to use Cloudflare bindings
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config
  // The `initOpenNextCloudflareForDev` call will handle the rest
};

export default nextConfig;
