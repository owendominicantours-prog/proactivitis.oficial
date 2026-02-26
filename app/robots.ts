import type { MetadataRoute } from "next";

const BASE_URL = "https://proactivitis.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/portal", "/customer", "/checkout", "/search", "/preview"]
      }
    ],
    sitemap: [
      `${BASE_URL}/sitemap-index.xml`,
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/sitemap-hotels.xml`,
      `${BASE_URL}/sitemap-transfers.xml`,
      `${BASE_URL}/sitemap-tour-variants.xml`,
      `${BASE_URL}/sitemap-things-to-do.xml`,
      `${BASE_URL}/sitemap-party-boat.xml`,
      `${BASE_URL}/sitemap-santo-domingo.xml`,
      `${BASE_URL}/sitemap-samana-whale.xml`,
      `${BASE_URL}/sitemap-buggy-atv.xml`,
      `${BASE_URL}/sitemap-parasailing.xml`,
      `${BASE_URL}/sitemap-safety-guides.xml`,
      `${BASE_URL}/sitemap-i18n.xml`,
      `${BASE_URL}/sitemap-images.xml`,
      `${BASE_URL}/sitemap-seo-only-tours.xml`,
      `${BASE_URL}/sitemap-transfer-seo-only.xml`,
      `${BASE_URL}/sitemap-urgent-discovered.xml`,
      `${BASE_URL}/sitemap-prodiscovery.xml`
    ]
  };
}
