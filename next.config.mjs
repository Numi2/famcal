/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    if (!config.resolve) config.resolve = {}
    if (!config.resolve.fallback) config.resolve.fallback = {}
    Object.assign(config.resolve.fallback, {
      fs: false,
      path: false,
    })
    return config
  },
}

export default nextConfig