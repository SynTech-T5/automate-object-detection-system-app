import type { NextConfig } from 'next';

const base = process.env.NEXT_PUBLIC_APP_URL!;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${base}/api/:path*` },
    ];
  },
};

export default nextConfig;