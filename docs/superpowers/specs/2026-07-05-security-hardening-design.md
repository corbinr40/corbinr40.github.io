# Pre-Launch Security Hardening — Design

**Date:** 2026-07-05
**Branch:** jekyll-upgrade
**Status:** Approved

## Context

A pre-launch security audit found three accepted-risk items beyond the quick fixes
already applied (search/sitemap visibility filters, OAuth `state`, worker input
normalization):

1. Hidden (`visible: false`) MDX draft content ships in the public JS bundle; the
   GitHub OAuth PasswordGate is a client-side rendering check, trivially bypassed.
2. The `/editor` page ships to production and persists a GitHub PAT in
   `localStorage` on the public origin.
3. GTM + GA4 fire without consent (UK GDPR/PECR gap). Two tracking setups exist
   (GTM container `GTM-KK3QFHFP` in `index.html`, `react-ga4` with `G-037GN6GVZP`
   in `main.tsx`), likely double-counting pageviews.

Decisions made with the user:

- Draft preview via local dev (`npm run dev`) is sufficient; no live-site preview.
- The editor is only used on the user's own machine.
- Replace Google analytics with cookieless Cloudflare Web Analytics; no banner.
- Draft exclusion implemented as a Vite transform plugin (not a drafts folder), so
  `visible: false` frontmatter remains the single source of truth.

## Section 1 — Draft protection

**New: `vite-plugin-drafts.ts`.** Vite plugin, `enforce: 'pre'`, `apply: 'build'`.
The `transform` hook runs before `@mdx-js/rollup`; for any id ending in `.mdx`
whose source matches `/visible:\s*false/`, return the stub
`export const frontmatter = null;\n` (valid MDX → empty component). The regex
deliberately matches `vite-plugin-sitemap.ts` so the two plugins cannot disagree.
Dev server is unaffected — drafts render normally at their real URLs in dev.

**Changed: `src/content/index.ts`.** `buildEntries` filters out modules whose
`frontmatter` is `null`/`undefined`. Stubbed drafts therefore disappear from
routes, search, listings, and RSS in production; draft URLs fall through to the
existing `NotFound` page. Widen `ContentModule.frontmatter` to
`ContentFrontmatter | null` — the glob's type parameter is an assertion, not a
check, and the stub makes `null` a real value.

**Changed: `src/pages/ContentPage.tsx`.** Remove the `PasswordGate` import and the
`isHidden` gating branch. In dev only (`import.meta.env.DEV`), render a small
"Draft — excluded from production" banner on `visible: false` pages.

**Deleted:** `src/components/PasswordGate.tsx`, `worker/` (Cloudflare Worker),
`.env.example`, and the `VITE_GITHUB_CLIENT_ID` / `VITE_GITHUB_AUTH_WORKER_URL`
env lines in `.github/workflows/deploy.yml`.

**Accepted:** the `visible: false` entries in `staticProjects`
(`src/content/index.ts`) remain in the bundle. They are one-line public-facing
teaser descriptions with no detail pages, filtered from all UI.

**Edge case:** the regex would false-positive on a *visible* MDX file whose body
text contains the literal `visible: false`. Accepted — same limitation as the
existing sitemap plugin, and draft body text never affects visible pages.

## Section 2 — Dev-only editor

**Changed: `src/App.tsx`.**
`const Editor = import.meta.env.DEV ? lazy(() => import('./pages/Editor')) : null;`
and render the `/editor` route only when `Editor` is non-null. At build time
`import.meta.env.DEV` is statically `false`, the dynamic import is dead code, and
Rollup drops the Editor chunk (~487 KB) and the jszip chunk (~97 KB) from the
production bundle. `/editor` then falls through to `NotFound` in production.

**Changed: `public/robots.txt`.** Remove `Disallow: /editor` (it advertises the
route). Keep `Disallow: /rss`.

**Unchanged:** token storage stays in `localStorage`, now reachable only on the
`localhost` dev origin.

## Section 3 — Cookieless analytics

**Changed: `index.html`.** Remove the GTM head script and the GTM `noscript`
iframe. Add the Cloudflare Web Analytics beacon:
`<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "<TOKEN>"}'></script>`.
The beacon tracks SPA route changes automatically via the History API; no React
code replaces the removed hook.

**Changed: `src/main.tsx`** (remove `ReactGA.initialize`), **`src/App.tsx`**
(remove `usePageTracking()` call). **Deleted:** `src/hooks/usePageTracking.ts`.
**Removed dependency:** `react-ga4` (npm uninstall).

**Changed: `src/pages/PrivacyPolicy.tsx`.** Drop Google Analytics/cookie language;
describe Cloudflare Web Analytics (cookieless, no personal data, no cross-site
tracking). Exact copy to be adjusted against the current page text.

**Blocking input:** the beacon token from the user's Cloudflare dashboard
(Web Analytics → Add a site). The token is public by design. All other work can
proceed with a placeholder; the token must be inserted before launch.

**SRI decision:** no `integrity` attribute on the beacon script. Cloudflare
serves `beacon.min.js` evergreen, so a pinned hash would silently disable
analytics at their next update (the browser refuses to execute a script whose
hash changed, with no visible failure). Accepted residual risk: compromise of
Cloudflare's CDN. If that trust is ever unacceptable, the alternative is
self-hosting a pinned copy of the beacon from `public/assets/` (same-origin, no
SRI needed) at the cost of manual updates.

## Verification

1. `npm run build` passes (script runs `tsc -b` first, so this typechecks).
2. Grep `dist/assets/*.js` for strings unique to draft MDX bodies — zero hits.
3. Grep `dist/` for `googletagmanager`, `gtag`, `G-037GN6GVZP` — zero hits;
   beacon script present in `dist/index.html`.
4. No Editor/jszip chunks in `dist/assets/`.
5. `vite preview`: draft URLs and `/editor` render the 404 page;
   `sitemap.xml` unchanged from the audit fix (9 public URLs).
6. In `npm run dev`: draft pages render with the draft banner; `/editor` works.

## Post-merge user actions (dashboards, not code)

- Delete the deployed `github-auth` Cloudflare Worker.
- Delete the GitHub OAuth App created for the gate.
- Delete repo secrets `VITE_GITHUB_CLIENT_ID` and `VITE_GITHUB_AUTH_WORKER_URL`.
- Replace the classic GitHub PAT used by the editor with a fine-grained PAT
  scoped to this repository with Contents read/write only.
- Create the Cloudflare Web Analytics site and provide the beacon token.

## Out of scope

- react-router upgrade (unfixed advisories are SSR-mode paths this SPA never
  executes; revisit at the next dependency pass).
- Any change to the gate quick-fixes already applied during the audit.
