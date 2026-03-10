import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/prompts',
        has: [{ type: 'host', value: 'prompts.ummerr.com' }],
      },
    ]
  },
};

export default nextConfig;
