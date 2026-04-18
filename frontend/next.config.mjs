/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  turbopack: {
    root: '../',
  },
  async rewrites() {
    const backendProxyUrl = process.env.BACKEND_PROXY_URL ?? 'http://localhost:3001';

    return [
      {
        source: '/api/:path*',
        destination: `${backendProxyUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;