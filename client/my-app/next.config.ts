import type { NextConfig } from 'next';

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8066";;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${base}/api/:path*` },
    ];
  },
};

export default nextConfig;