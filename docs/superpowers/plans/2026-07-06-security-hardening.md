# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exclude draft content from the production bundle, remove the editor and Google analytics from production, and add cookieless Cloudflare Web Analytics.

**Architecture:** A build-only Vite transform plugin stubs out `visible: false` MDX before the MDX compiler runs, making the frontmatter flag the single source of truth for draft exclusion. The editor route and Google tracking are compiled out of production via `import.meta.env.DEV` dead-code elimination and direct removal. Spec: `docs/superpowers/specs/2026-07-05-security-hardening-design.md`.

**Tech Stack:** Vite 5 plugin API, @mdx-js/rollup, React 18 + react-router (BrowserRouter SPA), GitHub Pages static hosting.

## Global Constraints

- Working branch: `jekyll-upgrade`. Never push; commits only.
- All git commits MUST be prefixed with identity env vars (git config writes fail in this WSL environment):
  `GIT_AUTHOR_NAME="Corbin" GIT_AUTHOR_EMAIL="corbinr40@live.com" GIT_COMMITTER_NAME="Corbin" GIT_COMMITTER_EMAIL="corbinr40@live.com" git commit ...`
- This repo has no unit-test framework and none should be added; each task's test cycle is a production build (`npm run build`, which runs `tsc -b` first, so it typechecks) plus assertions on `dist/` output. Run builds from the repo root.
- `npm run build` regenerates `dist/` and `tsconfig.tsbuildinfo`; never commit `dist/` (gitignored).
- The draft-detection regex is exactly `/visible:\s*false/` in both `vite-plugin-drafts.ts` and the existing `vite-plugin-sitemap.ts`. Do not "improve" one without the other.
- Draft MDX files currently in the repo: `src/content/projects/diceroll.mdx`, `src/content/projects/infinitediver.mdx`, `src/content/projects/zigbee-thermostat.mdx`.
- Known accepted leak (per spec): glob keys (file paths like `./projects/diceroll.mdx`) and the one-line `staticProjects` teasers remain in the bundle. Only draft *content* must be excluded.

---

### Task 1: Draft-exclusion Vite plugin

**Files:**
- Create: `vite-plugin-drafts.ts` (repo root, next to `vite-plugin-sitemap.ts`)
- Modify: `vite.config.ts:1-17`
- Modify: `src/content/index.ts:4-24`
- Test: production build output (`dist/assets/*.js`)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `draftsPlugin(): Plugin` (default export of `vite-plugin-drafts.ts`), registered in `vite.config.ts`. After this task, `projectEntries`/`blogEntries` in `src/content/index.ts` contain no entries with null frontmatter, and production builds contain no draft MDX content. Task 2 relies on draft URLs falling through to `NotFound` in production builds.

- [ ] **Step 1: Demonstrate the failing state (draft content currently leaks into the bundle)**

Run:
```bash
npm run build && grep -rl "chasing a target number" dist/assets/
```
Expected: build succeeds and grep prints at least one `dist/assets/index-*.js` filename. That phrase exists only in the body of `src/content/projects/diceroll.mdx` (a `visible: false` draft) — this is the leak being fixed. If grep prints nothing, STOP and investigate before continuing.

- [ ] **Step 2: Create the plugin**

Create `vite-plugin-drafts.ts` with exactly:

```ts
import type { Plugin } from 'vite';

/**
 * During production builds, replaces any MDX module whose frontmatter contains
 * `visible: false` with an empty stub, so draft content never enters the
 * public bundle. Dev server is untouched — drafts render normally for preview.
 *
 * The regex intentionally matches vite-plugin-sitemap.ts so the two plugins
 * can never disagree about what counts as a draft.
 */
export default function draftsPlugin(): Plugin {
  return {
    name: 'exclude-drafts',
    enforce: 'pre', // run before @mdx-js/rollup so the stub is what gets compiled
    apply: 'build',
    transform(code, id) {
      if (!id.endsWith('.mdx')) return null;
      if (!/visible:\s*false/.test(code)) return null;
      // Valid MDX: compiles to an empty component with null frontmatter.
      // src/content/index.ts filters these entries out.
      return { code: 'export const frontmatter = null;\n', map: null };
    },
  };
}
```

- [ ] **Step 3: Register the plugin**

In `vite.config.ts`, add the import after line 6 and the plugin as the first array entry. The result must be:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import sitemap from './vite-plugin-sitemap'
import drafts from './vite-plugin-drafts'

export default defineConfig({
  plugins: [
    // drafts() is enforce:'pre' — stubs visible:false MDX in prod builds
    drafts(),
    // mdx() must precede react() so .mdx files are transformed before JSX processing
    mdx({
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
    react(),
    sitemap(),
  ],
```
(Leave `base`, `css`, and everything below unchanged.)

- [ ] **Step 4: Filter stubbed entries in the content index**

In `src/content/index.ts`, change the `ContentModule` interface and `buildEntries` (currently lines 4–24) to:

```ts
interface ContentModule {
  default: ComponentType;
  // null when vite-plugin-drafts stubbed the module out of a production build
  frontmatter: ContentFrontmatter | null;
}
```

```ts
function buildEntries(modules: Record<string, ContentModule>) {
  return Object.entries(modules)
    .filter(([, mod]) => mod.frontmatter != null)
    .map(([path, mod]) => ({
      slug: extractSlug(path),
      frontmatter: mod.frontmatter!,
      Component: mod.default,
    }));
}
```

- [ ] **Step 5: Verify the leak is fixed (green)**

Run:
```bash
npm run build && echo "BUILD OK" \
  && (grep -rl "chasing a target number" dist/assets/ && echo "LEAK" || echo "NO DRAFT CONTENT") \
  && grep -c "<loc>" dist/sitemap.xml
```
Expected: `BUILD OK`, then `NO DRAFT CONTENT`, then `9` (sitemap unchanged). If `LEAK` prints, the transform did not run — check the plugin is first in the plugins array and `apply: 'build'` is spelled correctly.

- [ ] **Step 6: Verify dev preview still shows drafts**

Run: `timeout 20 npx vite --port 5199 & sleep 8 && curl -s http://localhost:5199/projects/games/diceroll | head -5; wait`
Expected: HTML response (the SPA shell — dev serves index.html for any route; actual page render is confirmed manually in Task 6). No errors from Vite startup mentioning `exclude-drafts`.

- [ ] **Step 7: Commit**

```bash
git add vite-plugin-drafts.ts vite.config.ts src/content/index.ts
GIT_AUTHOR_NAME="Corbin" GIT_AUTHOR_EMAIL="corbinr40@live.com" GIT_COMMITTER_NAME="Corbin" GIT_COMMITTER_EMAIL="corbinr40@live.com" \
  git commit -m "feat: exclude draft MDX content from production bundle via Vite plugin"
```

---

### Task 2: Remove the OAuth gate, add dev draft banner

**Files:**
- Modify: `src/pages/ContentPage.tsx:20,49,66-99`
- Modify: `.github/workflows/deploy.yml:29-32`
- Delete: `src/components/PasswordGate.tsx`, `worker/` (both untracked — plain `rm`, no git rm), `.env.example` (untracked)

**Interfaces:**
- Consumes: Task 1's guarantee that draft entries are absent from production `projectEntries`, so `getProjectBySlug` returns null and the existing `NotFound` renders for draft URLs.
- Produces: `ContentPage.tsx` no longer references `PasswordGate` (the file is gone). No `VITE_GITHUB_*` env anywhere. Task 4 also edits `deploy.yml`'s neighborhood — this task must complete first.

- [ ] **Step 1: Remove the gate from ContentPage and add the dev banner**

In `src/pages/ContentPage.tsx`:

a. Delete line 20: `import PasswordGate from '../components/PasswordGate';`

b. Replace `const isHidden = frontmatter.visible === false;` (line 49) with:
```tsx
  const isDraft = frontmatter.visible === false;
```

c. Inside `pageContent`, directly after the Breadcrumbs `<div>` (currently lines 68–70), insert:
```tsx
      {import.meta.env.DEV && isDraft && (
        <div className="container px-4 pt-3">
          <div className="alert alert-warning py-2 mb-0" role="alert">
            <i className="bi bi-eye-slash me-2" />
            Draft — excluded from production builds
          </div>
        </div>
      )}
```

d. Replace the final gate branch (currently lines 91–99):
```tsx
  if (isHidden) {
    return (
      <PasswordGate title={frontmatter.title}>
        {pageContent}
      </PasswordGate>
    );
  }

  return pageContent;
```
with:
```tsx
  return pageContent;
```

- [ ] **Step 2: Delete the gate artifacts**

```bash
rm src/components/PasswordGate.tsx .env.example && rm -rf worker/
```
(All three are untracked; `git status` must not show deletions afterwards.)

- [ ] **Step 3: Remove the OAuth env block from the deploy workflow**

In `.github/workflows/deploy.yml`, replace:
```yaml
      - run: npm run build
        env:
          VITE_GITHUB_CLIENT_ID: ${{ secrets.VITE_GITHUB_CLIENT_ID }}
          VITE_GITHUB_AUTH_WORKER_URL: ${{ secrets.VITE_GITHUB_AUTH_WORKER_URL }}
```
with:
```yaml
      - run: npm run build
```

- [ ] **Step 4: Verify**

Run:
```bash
npm run build && echo "BUILD OK" && grep -rn "PasswordGate\|VITE_GITHUB" src/ .github/ | grep -v Binary || echo "NO REFERENCES"
```
Expected: `BUILD OK` then `NO REFERENCES`. (The build's `tsc -b` proves ContentPage compiles without the deleted import.)

- [ ] **Step 5: Commit**

```bash
git add src/pages/ContentPage.tsx .github/workflows/deploy.yml
GIT_AUTHOR_NAME="Corbin" GIT_AUTHOR_EMAIL="corbinr40@live.com" GIT_COMMITTER_NAME="Corbin" GIT_COMMITTER_EMAIL="corbinr40@live.com" \
  git commit -m "feat: replace OAuth draft gate with build-time exclusion, add dev draft banner"
```

---

### Task 3: Dev-only editor

**Files:**
- Modify: `src/App.tsx:14,29-42`
- Modify: `public/robots.txt`
- Test: production build output (`dist/assets/`)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `Editor` in `App.tsx` is `LazyExoticComponent | null` (null in prod builds). Task 4 also edits `App.tsx` — this task must complete first so Task 4's edits apply cleanly.

- [ ] **Step 1: Demonstrate the failing state**

Run: `ls dist/assets/ | grep -i "editor\|jszip"`
Expected: prints `Editor-*.js` and `jszip.min-*.js` — the editor currently ships to production.

- [ ] **Step 2: Compile the editor out of production**

In `src/App.tsx`, replace line 14:
```tsx
const Editor = lazy(() => import('./pages/Editor'));
```
with:
```tsx
// Dev-only: import.meta.env.DEV is statically false in prod builds, so the
// dynamic import is dead code and Rollup drops the Editor + jszip chunks.
const Editor = import.meta.env.DEV ? lazy(() => import('./pages/Editor')) : null;
```

Then wrap the `/editor` route (currently lines 29–42) in a null-check so JSX narrows the type:
```tsx
        {Editor && (
          <Route
            path="/editor"
            element={
              <Suspense fallback={
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              }>
                <Editor />
              </Suspense>
            }
          />
        )}
```

- [ ] **Step 3: Stop advertising the route**

In `public/robots.txt`, delete the line `Disallow: /editor` (keep `Disallow: /rss`).

- [ ] **Step 4: Verify (green)**

Run:
```bash
npm run build && echo "BUILD OK" \
  && (ls dist/assets/ | grep -i "editor\|jszip" && echo "EDITOR SHIPPED" || echo "EDITOR EXCLUDED") \
  && grep -c "editor" dist/robots.txt || true
```
Expected: `BUILD OK`, `EDITOR EXCLUDED`, then `0` (robots.txt clean). Note the prod bundle should shrink by roughly 585 KB versus Step 1.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx public/robots.txt
GIT_AUTHOR_NAME="Corbin" GIT_AUTHOR_EMAIL="corbinr40@live.com" GIT_COMMITTER_NAME="Corbin" GIT_COMMITTER_EMAIL="corbinr40@live.com" \
  git commit -m "feat: exclude editor from production builds"
```

---

### Task 4: Swap Google analytics for Cloudflare Web Analytics

**Files:**
- Modify: `index.html` (GTM script block lines ~15–22, GTM noscript block in `<body>`, add beacon)
- Modify: `src/main.tsx:3,8`
- Modify: `src/App.tsx:12,17` (after Task 3's edits)
- Delete: `src/hooks/usePageTracking.ts` (tracked — use `git rm`)
- Modify: `package.json` + `package-lock.json` (via `npm uninstall react-ga4`)

**Interfaces:**
- Consumes: Task 3's edited `App.tsx`.
- Produces: no Google tracking anywhere; beacon tag in `index.html`. If the user has NOT yet supplied the Cloudflare token, the literal sentinel `REPLACE_WITH_CF_BEACON_TOKEN` remains and Task 6 flags it as a launch blocker.

- [ ] **Step 1: Remove GTM from index.html and add the beacon**

a. Delete this entire block from `<head>` (lines ~15–22):
```html
    <!-- Google Tag Manager -->
    <script>
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-KK3QFHFP');
    </script>
```

b. Delete this entire block from `<body>`:
```html
    <!-- Google Tag Manager (noscript) -->
    <noscript>
      <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KK3QFHFP"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
    </noscript>
```

c. Directly after `<script type="module" src="/src/main.tsx"></script>`, insert:
```html
    <!-- Cloudflare Web Analytics: cookieless, tracks SPA routes automatically.
         No SRI by design — the beacon is served evergreen; a pinned hash would
         silently disable analytics on Cloudflare's next update (see spec). -->
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon='{"token": "REPLACE_WITH_CF_BEACON_TOKEN"}'
    ></script>
```
**If the user has provided the real beacon token, use it instead of the sentinel.** Check the task/conversation context before defaulting to the sentinel.

- [ ] **Step 2: Remove react-ga4 initialization**

In `src/main.tsx`, delete line 3 (`import ReactGA from 'react-ga4';`) and line 8 (`ReactGA.initialize('G-037GN6GVZP');`), leaving:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import './styles/global.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 3: Remove the tracking hook**

In `src/App.tsx`, delete the import `import { usePageTracking } from './hooks/usePageTracking';` (line 12) and the call `usePageTracking();` (first line of `AppRoutes`). Then:
```bash
git rm src/hooks/usePageTracking.ts
```

- [ ] **Step 4: Uninstall react-ga4**

```bash
npm uninstall react-ga4
```
Expected: `package.json` no longer lists `react-ga4`; lockfile updated.

- [ ] **Step 5: Verify (green)**

Run:
```bash
npm run build && echo "BUILD OK" \
  && (grep -rl "googletagmanager\|G-037GN6GVZP\|react-ga4" dist/ && echo "GOOGLE REMNANTS" || echo "GOOGLE-FREE") \
  && grep -c "cloudflareinsights" dist/index.html
```
Expected: `BUILD OK`, `GOOGLE-FREE`, then `1`.

- [ ] **Step 6: Commit**

```bash
git add index.html src/main.tsx src/App.tsx package.json package-lock.json
GIT_AUTHOR_NAME="Corbin" GIT_AUTHOR_EMAIL="corbinr40@live.com" GIT_COMMITTER_NAME="Corbin" GIT_COMMITTER_EMAIL="corbinr40@live.com" \
  git commit -m "feat: replace GTM/GA4 with cookieless Cloudflare Web Analytics"
```
(The `git rm` from Step 3 is already staged.)

---

### Task 5: Privacy policy — add website section, keep app policy

**Files:**
- Modify: `src/pages/PrivacyPolicy.tsx:8-13`

**Context an implementer needs:** the existing page is the **Dice Roll mobile app's** app-store privacy policy (Google Play requires a hosted policy URL), NOT a website policy. Do not delete or rewrite the app content — add a website section above it and give the app policy its own heading.

**Interfaces:**
- Consumes: nothing from other tasks (analytics copy describes the post-Task-4 state).
- Produces: nothing consumed by other tasks.

- [ ] **Step 1: Insert the website section and app heading**

In `src/pages/PrivacyPolicy.tsx`, directly after `<div className="col-lg-8 mx-auto">` (line 9) and before the existing first `<p>`, insert:

```tsx
          <h2 className="mt-2">This Website</h2>
          <p>
            This website (corbinr40.com) does not use cookies and does not collect
            personal information. Anonymous, aggregated visit statistics — page
            views, referrers, and performance timings — are measured with
            Cloudflare Web Analytics, which uses no cookies or client-side storage
            and does not track visitors across sites. See{' '}
            <a href="https://www.cloudflare.com/web-analytics/" target="_blank" rel="noopener noreferrer">
              Cloudflare Web Analytics
            </a>{' '}
            for details. The site is hosted on GitHub Pages, which may log IP
            addresses for security and operational purposes; see the{' '}
            <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">
              GitHub Privacy Statement
            </a>.
          </p>

          <h2 className="mt-4">Dice Roll App</h2>
```

The existing paragraph beginning "Corbin Richardson built the Dice Roll app…" now sits under the "Dice Roll App" heading. Change nothing else in the file.

- [ ] **Step 2: Verify and commit**

Run: `npm run build && echo "BUILD OK"`
Expected: `BUILD OK`.

```bash
git add src/pages/PrivacyPolicy.tsx
GIT_AUTHOR_NAME="Corbin" GIT_AUTHOR_EMAIL="corbinr40@live.com" GIT_COMMITTER_NAME="Corbin" GIT_COMMITTER_EMAIL="corbinr40@live.com" \
  git commit -m "docs: add website privacy section for cookieless analytics"
```

---

### Task 6: Final verification sweep

**Files:**
- No new changes; verification only. Test: full build + `vite preview` + dev server.

**Interfaces:**
- Consumes: all prior tasks complete.
- Produces: a pass/fail report against the spec's verification checklist, including whether the beacon token sentinel is still present (launch blocker if so).

- [ ] **Step 1: Full spec verification**

Run each check; every expected value must match:

```bash
npm run build && echo "1. BUILD OK"
grep -rl "chasing a target number\|ridiculous amount of fun" dist/assets/ || echo "2. NO DRAFT CONTENT"
grep -rl "googletagmanager\|G-037GN6GVZP" dist/ || echo "3. GOOGLE-FREE"
ls dist/assets/ | grep -ci "editor\|jszip" || echo "4. NO EDITOR CHUNKS"
grep -c "<loc>" dist/sitemap.xml   # expect: 9
grep -o 'token[^}]*' dist/index.html   # expect real token, NOT REPLACE_WITH_CF_BEACON_TOKEN
```

- [ ] **Step 2: Runtime spot-checks**

```bash
npx vite preview --port 5199 &
sleep 3
curl -s http://localhost:5199/projects/games/diceroll | grep -o "<title>[^<]*" | head -1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5199/editor
kill %1
```
Expected: both routes serve the SPA shell (client-side NotFound renders for each — confirm visually in a browser if unsure: draft URL and `/editor` both show the 404 page in preview, while `npm run dev` shows the draft page with the yellow banner and a working editor).

- [ ] **Step 3: Report**

Summarize pass/fail per check. If the beacon sentinel is still present, report it as the single remaining launch blocker. Remind of dashboard cleanup (delete CF worker, GitHub OAuth app, the two repo secrets; switch to fine-grained PAT; create CF Web Analytics site).
