/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactCompiler: true, // for react 19.2
  // devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig
