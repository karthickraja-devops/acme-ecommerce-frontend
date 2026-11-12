
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: "incremental",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "acme-store-product-images-unique.s3.us-east-2.amazonaws.com",
        pathname: "/products/**",
      },
    ],
  },
};

const withVercelToolbar = require("@vercel/toolbar/plugins/next")();

module.exports = withVercelToolbar(nextConfig);
