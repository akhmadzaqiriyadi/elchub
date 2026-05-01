/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.dev-apps.utycreative.cloud',
        pathname: '/**',
      },
    ],
  },
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