/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
];

const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "blob.vercel-storage.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/prodiscovery/:path*",
        destination: "/tours",
        permanent: true
      },
      {
        source: "/en/prodiscovery/:path*",
        destination: "/en/tours",
        permanent: true
      },
      {
        source: "/fr/prodiscovery/:path*",
        destination: "/fr/tours",
        permanent: true
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.proactivitis.com" }],
        destination: "https://proactivitis.com/:path*",
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
