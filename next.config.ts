import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages that should not be bundled on server-side
  serverExternalPackages: ["pdf-parse", "xlsx"],
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Experimental features and optimizations
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      'react-hook-form',
      'zod'
    ],
  },
  
  // Turbopack configuration for faster builds
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Build-time type checking and linting
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Security headers for production
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compression
  compress: true,
  
  // Power pack bundle analyzer (commented out for production)
  // bundlePack: {
  //   analyze: process.env.ANALYZE === 'true',
  // },
};

export default nextConfig;
