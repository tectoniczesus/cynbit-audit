// Fixes SEC-03 and SEC-04. Use ONE host everywhere (here: www) and a 308 redirect for the other.
// app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE = "https://www.cynbit.in";
// Source lastmod from content (CMS / file mtime), NOT new Date(): crawlers ignore always-fresh dates
const pages = [
  { path: "", lastModified: "2026-10-01" },
  { path: "/story", lastModified: "2026-08-12" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({ url: `${BASE}${p.path}`, lastModified: p.lastModified }));
}

// app/robots.ts
export function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }], // protect /admin and /portal with auth + X-Robots-Tag instead
    sitemap: `${BASE}/sitemap.xml`,
  };
}

// app/layout.tsx: resolve og:url / og:image / canonical against the same host
// export const metadata = { metadataBase: new URL(BASE), alternates: { canonical: "/" },
//   openGraph: { images: ["/og.png"] } }  // 1200x630 PNG; SVG is not supported by most social scrapers
