import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/datacard',
        destination: '/dataset',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
