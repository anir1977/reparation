import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations de performance
  reactStrictMode: true,
  
  // Compression
  compress: true,
  
  // Optimisation des images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Experimental features pour la performance
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
};

export default nextConfig;
