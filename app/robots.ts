import type { MetadataRoute } from "next";
import { getPublicSiteOrigin } from "@/lib/http/site-origin";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getPublicSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/api/", "/auth/", "/login", "/signup", "/forgot-password", "/reset-password"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
