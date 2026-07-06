import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://corbinr40.com';

const staticRoutes = ['/', '/blog', '/search', '/privacy', '/contact'];

export default function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    apply: 'build',
    closeBundle() {
      const projectDir = path.resolve(__dirname, 'src/content/projects');
      const blogDir = path.resolve(__dirname, 'src/content/blog');

      const projectSlugs = fs.existsSync(projectDir)
        ? fs.readdirSync(projectDir).filter((f) => f.endsWith('.mdx')).map((f) => f.replace('.mdx', ''))
        : [];
      const blogSlugs = fs.existsSync(blogDir)
        ? fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx')).map((f) => f.replace('.mdx', ''))
        : [];

      const isVisible = (dir: string, slug: string) =>
        !/visible:\s*false/.test(fs.readFileSync(path.join(dir, `${slug}.mdx`), 'utf-8'));

      const projectUrls = projectSlugs
        .filter((slug) => isVisible(projectDir, slug))
        .map((slug) => {
          const content = fs.readFileSync(path.join(projectDir, `${slug}.mdx`), 'utf-8');
          const categoryMatch = content.match(/category:\s*"([^"]+)"/);
          const category = categoryMatch ? categoryMatch[1] : 'programs';
          return `/projects/${category}/${slug}`;
        });

      const blogUrls = blogSlugs
        .filter((slug) => isVisible(blogDir, slug))
        .map((slug) => `/blog/${slug}`);

      const allUrls = [...staticRoutes, ...projectUrls, ...blogUrls];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${SITE_URL}${url}</loc>
  </url>`).join('\n')}
</urlset>`;

      const distDir = path.resolve(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml);
      }
    },
  };
}
