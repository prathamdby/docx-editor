/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {},
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["localhost", "avatars.githubusercontent.com"],
  },
};

export default nextConfig;
