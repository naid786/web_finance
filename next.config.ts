import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "xlsx"]
  },
  reactStrictMode: true,
  images: {
    domains: [], // Add your image domains here if needed
  },
  // Add more options as needed (headers, redirects, rewrites)
};

export default nextConfig;
