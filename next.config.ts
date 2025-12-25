import type { NextConfig } from "next";

// @ts-ignore
import withPWA from "next-pwa";

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

// @ts-ignore
export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
