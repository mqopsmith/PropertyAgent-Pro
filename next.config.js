/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // For Cloudflare Pages
  distDir: 'dist',
  // Disable server-side features for static export
  experimental: {
    appDir: false
  }
}

module.exports = nextConfig
