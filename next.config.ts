import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'binjib-dabang.s3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
