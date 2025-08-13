import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://server:8066/api/:path*' },
    ];
  },
};

export default nextConfig;