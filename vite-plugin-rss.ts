import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://corbinr40.com';

// Extracts a double-quoted frontmatter string, tolerating escaped quotes
// inside the value (e.g. description: "a \"quick\" rebuild").
function fmString(src: string, key: string): string | undefined {
  const m = src.match(new RegExp(`^${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'm'));
  return m ? m[1].replace(/\\(.)/g, '$1') : undefined;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc2822(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) return '';
  return d.toUTCString();
}

export default function rssPlugin(): Plugin {
  return {
    name: 'generate-rss',
    apply: 'build',
    closeBundle() {
      const blogDir = path.resolve(__dirname, 'src/content/blog');
      if (!fs.existsSync(blogDir)) return;

      const posts = fs
        .readdirSync(blogDir)
        .filter((f) => f.endsWith('.mdx'))
        .map((f) => {
          const src = fs.readFileSync(path.join(blogDir, f), 'utf-8');
          return {
            slug: f.replace(/\.mdx$/, ''),
            title: fmString(src, 'title') ?? f.replace(/\.mdx$/, ''),
            description: fmString(src, 'description') ?? '',
            date: fmString(src, 'date'),
            // Same draft signal as vite-plugin-sitemap.ts and vite-plugin-drafts.ts
            visible: !/visible:\s*false/.test(src),
          };
        })
        .filter((p) => p.visible)
        .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

      const items = posts
        .map((post) => {
          const link = `${SITE_URL}/blog/${post.slug}`;
          const pubDate = toRfc2822(post.date);
          return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <description>${escapeXml(post.description)}</description>${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ''}
      <guid>${link}</guid>
    </item>`;
        })
        .join('\n');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>corbinr40's Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Blog posts by Corbin Richardson</description>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

      const distDir = path.resolve(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, 'rss.xml'), xml);
      }
    },
  };
}
