import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // Add your image domains here if needed
  },
  // Add more options as needed (headers, redirects, rewrites)
};

export default nextConfig;
