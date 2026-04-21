import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = process.env.SITE_URL || "https://imagemagic.com";

const pages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/resize", changefreq: "weekly", priority: "0.9" },
  { path: "/convert", changefreq: "weekly", priority: "0.9" },
  { path: "/remove-background", changefreq: "weekly", priority: "0.9" },
  { path: "/object-removal", changefreq: "weekly", priority: "0.85" },
  { path: "/resize-upscale", changefreq: "weekly", priority: "0.85" },
  { path: "/pricing", changefreq: "monthly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
];

const toAbsolute = (path) => new URL(path, SITE_URL).toString();

const sitemapEntries = pages
  .map((page) => {
    const loc = toAbsolute(page.path);

    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`;
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;

const outputPath = resolve("public", "sitemap.xml");
writeFileSync(outputPath, sitemap, { encoding: "utf-8" });
console.log(`Sitemap generated at ${outputPath}`);
