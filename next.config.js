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
  compress: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
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
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/fototours/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/transfer/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/logo/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/robots.txt",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" }]
      },
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
