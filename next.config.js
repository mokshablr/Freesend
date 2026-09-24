const { withContentCollections } = require("@content-collections/next");

import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Lint the whole repo, not only Next's default app/, components/ and lib/.
  eslint: {
    dirs: ["."],
  },
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

// withContentCollections must be the outermost plugin.
module.exports = withContentCollections(nextConfig);
