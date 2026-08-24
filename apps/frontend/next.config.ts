import type { NextConfig } from "next";

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

function r2Hostname(): string | null {
  if (!R2_PUBLIC_URL) return null;
  try {
    return new URL(R2_PUBLIC_URL).hostname;
  } catch {
    return null;
  }
}

const r2Host = r2Hostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "r2.dev",
        pathname: "/**",
      },
      ...(r2Host
        ? [{ protocol: "https" as const, hostname: r2Host, pathname: "/**" }]
        : []),
    ],
  },
};

export default nextConfig;
