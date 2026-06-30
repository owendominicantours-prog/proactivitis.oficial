import type { MetadataRoute } from "next";

const BASE_URL = "https://proactivitis.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "meta-externalagent",
        disallow: "/"
      },
      {
        userAgent: "meta-externalfetcher",
        disallow: "/"
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/portal", "/customer", "/checkout", "/search", "/preview"]
      }
    ],
    sitemap: [`${BASE_URL}/sitemap-index.xml`]
  };
}
