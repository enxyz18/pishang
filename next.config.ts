import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/**", // Benarkan semua laluan gambar TMDB
      },
    ],
  },
};

export default nextConfig;