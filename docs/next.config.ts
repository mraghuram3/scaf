import type { NextConfig } from "next";

// @ts-ignore
const nextConfig: NextConfig = {
    // experimental: {
    //     esmExternals: "loose",
    //     serverComponentsExternalPackages: ["mongoose"]
    // },
    // webpack: (config) => {
    //     config.experiments = {
    //         topLevelAwait: true
    //     };
    //     return config;
    // },
    reactStrictMode: true,
    swcMinify: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },

};

export default nextConfig;
