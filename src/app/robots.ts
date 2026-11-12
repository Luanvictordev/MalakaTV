import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const baseUrl = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/login", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
