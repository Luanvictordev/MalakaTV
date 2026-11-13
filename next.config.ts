import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    "/": [
      "./public/images/malaka-profile.jpg",
      "./content/*.json",
      "./public/atlas/atlas-tree-3.30.json",
    ],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
