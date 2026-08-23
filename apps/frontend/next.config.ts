import type { NextConfig } from "next";

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "https://pub-xxxxx.r2.dev";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "r2.dev",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_R2_PUBLIC_URL: R2_PUBLIC_URL,
  },
};

export default nextConfig;
