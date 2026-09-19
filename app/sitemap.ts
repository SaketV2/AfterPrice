import type { MetadataRoute } from "next";
import { resources } from "@/components/marketing/marketing-data";
import { getPublicSiteOrigin } from "@/lib/http/site-origin";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getPublicSiteOrigin();
  const routes = ["/", "/how-it-works", "/pricing", "/demo", "/faq", "/coverage", "/data-privacy", "/resources", ...resources.map((resource) => `/resources/${resource.slug}`), "/privacy", "/terms"];
  return routes.map((route) => ({ url: `${siteUrl}${route}` }));
}
