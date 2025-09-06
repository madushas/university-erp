import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Only ignore during builds in development, not production
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  typescript: {
    // Enable strict type checking for production builds
    ignoreBuildErrors: false,
  },
  // Removed experimental config that doesn't exist
};

export default nextConfig;