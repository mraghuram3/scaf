import type { NextConfig } from "next";

// @ts-ignore
const nextConfig: NextConfig = {
    experimental: {
        runtime: 'experimental-edge',
    },
    reactStrictMode: true,
    swcMinify: true,
};

export default nextConfig;
