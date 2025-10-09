import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'grandview-storage.s3.amazonaws.com',
        port: '',
        pathname: '/packages/**',  // Restrict to packages folder for security
      },
      {
        protocol: 'https',
        hostname: 'grandview-storage.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/packages/**',  // Include region-specific hostname if used
      },
    ],
  },
};

export default withPWA({
  dest: 'public', // Output directory for the generated service worker
  disable: false, // Enable in development for testing; revert to process.env.NODE_ENV === 'development' after testing
  register: true, // Automatically register the service worker
  skipWaiting: true, // Skip waiting on install
  swSrc: 'app/sw.js', // Path to the custom service worker source file
  swDest: 'sw.js', // Output filename for the generated service worker (in public/)
})(nextConfig);