/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  experimental: {
    serverComponentsExternalPackages: ["pg", "pg-native", "@prisma/client", "prisma"],
  },
};

export default nextConfig;
