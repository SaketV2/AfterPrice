import type { MetadataRoute } from "next";
import { resources } from "@/components/marketing/marketing-data";

const siteUrl = "https://afterprice.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/how-it-works", "/pricing", "/demo", "/faq", "/resources", ...resources.map((resource) => `/resources/${resource.slug}`), "/privacy", "/terms"];
  return routes.map((route) => ({ url: `${siteUrl}${route}` }));
}
