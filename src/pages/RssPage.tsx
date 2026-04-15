import { useEffect, useRef } from 'react';
import { blogEntries } from '../content';
import SEO from '../components/SEO';

const SITE_URL = 'https://corbinr40.github.io';

function toRfc2822(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) return '';
  return d.toUTCString();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRssXml(): string {
  const posts = blogEntries
    .filter((e) => e.frontmatter.visible !== false)
    .slice()
    .sort((a, b) => {
      const dateA = a.frontmatter.date ?? '';
      const dateB = b.frontmatter.date ?? '';
      return dateB.localeCompare(dateA);
    });

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = toRfc2822(post.frontmatter.date);
      return `    <item>
      <title>${escapeXml(post.frontmatter.title)}</title>
      <link>${link}</link>
      <description>${escapeXml(post.frontmatter.description)}</description>${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ''}
      <guid>${link}</guid>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>corbinr40's Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Blog posts by Corbin Richardson</description>
    <atom:link href="${SITE_URL}/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export default function RssPage() {
  const downloadedRef = useRef(false);

  useEffect(() => {
    if (downloadedRef.current) return;
    downloadedRef.current = true;

    const xml = generateRssXml();
    const blob = new Blob([xml], { type: 'application/rss+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rss.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <>
      <SEO title="RSS Feed" />
      <div className="container px-4 py-5">
        <h1 className="pb-2 border-bottom">RSS Feed</h1>
        <p className="mt-3">
          Your RSS feed download should begin automatically. If it does not,{' '}
          <button
            type="button"
            className="btn btn-link p-0 align-baseline"
            onClick={() => {
              const xml = generateRssXml();
              const blob = new Blob([xml], { type: 'application/rss+xml' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'rss.xml';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            click here
          </button>{' '}
          to download the RSS XML file.
        </p>
        <p className="text-muted small">
          <i className="bi bi-info-circle me-1" />
          You can subscribe to this feed using any RSS reader by pointing it to{' '}
          <code>{SITE_URL}/rss</code>.
        </p>
      </div>
    </>
  );
}
