/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@journium/nextjs', '@journium/react', 'journium-js', '@journium/core']
};

module.exports = nextConfig;