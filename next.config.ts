import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.126"],
  experimental: {
    // Raise from default 1 MB. We don't expect to actually use server actions
    // for uploads (they go through /api/proxy/products/upload-image instead),
    // but giving it some headroom prevents surprise 413s.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;