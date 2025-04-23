/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    experimental: {
        serverActions: {
          bodySizeLimit: '50mb',
        },
      },
};

module.exports = nextConfig;
