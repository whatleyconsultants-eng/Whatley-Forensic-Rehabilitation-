/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-storage-domain.com'], // Add your S3/storage domain here
  },
}

module.exports = nextConfig
