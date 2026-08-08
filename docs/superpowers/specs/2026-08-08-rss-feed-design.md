# Static RSS Feed — Design

**Date:** 2026-08-08
**Branch:** main
**Status:** Approved (conversationally)

## Problem

`/rss` is a client-rendered React page that generates RSS XML in the browser
and triggers a download. Feed readers fetching the URL get the SPA HTML shell,
so no reader can subscribe. `robots.txt` also disallows `/rss`, and
`index.html` advertises the broken URL.

## Design

- **New `vite-plugin-rss.ts`** (repo root, mirrors `vite-plugin-sitemap.ts`):
  build-only `closeBundle` hook reads `src/content/blog/*.mdx`, extracts
  `title` / `description` / `date` from frontmatter via regex (handling
  escaped quotes inside strings), skips `visible: false` (same
  `/visible:\s*false/` regex as the sitemap and drafts plugins), sorts by date
  descending, and writes RSS 2.0 XML to `dist/rss.xml`. The `atom:link`
  self-reference points at `https://corbinr40.com/rss.xml`.
- **`src/pages/RssPage.tsx`**: download machinery removed; the page becomes a
  short explainer linking to `/rss.xml`. Route stays at `/rss`.
- **`index.html`**: `<link rel="alternate">` href `/rss` → `/rss.xml`.
- **`public/robots.txt`**: remove `Disallow: /rss` (prefix matching would
  block `/rss.xml` too).
- `vite.config.ts`: register the plugin.

## Notes

- `/rss.xml` exists only in build output (like `sitemap.xml`); in dev it 404s.
- Feed regenerates on every deploy, so editor-published posts appear
  automatically.

## Verification

`npm run build`; `dist/rss.xml` is well-formed XML containing the visible blog
post and no drafts; `dist/robots.txt` has no `/rss` disallow; `dist/index.html`
references `/rss.xml`.
