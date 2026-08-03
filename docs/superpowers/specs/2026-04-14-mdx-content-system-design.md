# MDX Content System Design

## Context

The portfolio site currently has hardcoded project pages as individual TSX files (e.g., `src/pages/projects/RTCC.tsx`). Project metadata is duplicated between `src/data/projects.ts` (used for card listings) and each page component (used for OverviewTable). Adding a new project requires creating a new TSX file, adding a route in `App.tsx`, and adding an entry to `projects.ts`.

This design replaces that with an MDX-based content system where each project or blog post is a single `.mdx` file. Adding content means dropping in one file — no routing changes, no data file edits.

## Content File Format

Each content item is an `.mdx` file with YAML frontmatter for structured metadata and an MDX body for rich content.

### Frontmatter Schema

```yaml
---
id: string              # URL slug, unique identifier
title: string           # Display title
description: string     # Short description for cards/SEO
category: string        # "programs" | "games" | "3dprojects" | "demos" (projects only)
devTypes: string[]      # "personal" | "university" | "industry" | "jam" | "extLink"
skills: string[]        # Frameworks/languages for filtering and display
image: string           # Card thumbnail image path (optional)
status: string          # "completed" | "ongoing" | "coming-soon" | "ended"
type: string            # e.g., "Desktop Application", "Web Game"
duration: string        # e.g., "2023 - Present"
software: string        # e.g., "Visual Studio, PyCharm"
languages: string       # e.g., "Python, C++"
availableOn: string | { label: string, href: string }  # Where to find/use the project
contentType: string     # "project" | "blog"
visible: boolean        # Whether to show in listings
---
```

### MDX Body

The body uses standard Markdown plus React components that are automatically available:

- `<HeroSection>` — Page hero with title, intro paragraphs, optional image
- `<OverviewTable />` — Renders the 6 metadata fields from frontmatter (no props needed)
- `<FeatureSection>` — Titled content section with optional side image
- `<ImageCarousel>` — Bootstrap image carousel

Example (abbreviated RTCC):

```mdx
---
id: "rtcc"
title: "Real-Time Captioning & Communication"
description: "A real-time captioning system using Whisper AI"
category: "programs"
devTypes: ["personal"]
skills: ["Python", "C++", "Whisper"]
image: "/images/projects/rtcc/card.png"
status: "completed"
type: "Desktop Application"
duration: "2023 - Present"
software: "Visual Studio, PyCharm"
languages: "Python, C++"
availableOn:
  label: "GitHub"
  href: "https://github.com/..."
contentType: "project"
visible: true
---

<HeroSection title="RTCC" paragraphs={["Intro paragraph here..."]} imageSrc="/images/rtcc-hero.png" />

<OverviewTable />

<FeatureSection title="Features" imageSrc="/images/rtcc-features.png" imageAlt="Features screenshot">

- Real-time speech-to-text transcription
- Multi-language support
- Customizable UI

</FeatureSection>

<FeatureSection title="Hardware">

Description of hardware setup...

<ImageCarousel id="hw-carousel" images={[
  { src: "/images/hw1.png", alt: "Hardware 1" },
  { src: "/images/hw2.png", alt: "Hardware 2" }
]} />

More text after the carousel.

</FeatureSection>
```

## Architecture

### File Structure

```
src/content/
  projects/
    rtcc.mdx
    diceroll.mdx
    infinitediver.mdx
    letsplay.mdx
    scraper.mdx
  blog/
    (future blog posts)
  index.ts              # Content registry — aggregates all MDX frontmatter
```

### Content Registry (`src/content/index.ts`)

Uses Vite's `import.meta.glob` to dynamically discover all `.mdx` files at build time. Extracts frontmatter from each file and exports:

- `allProjects` — Array of project metadata (replaces `projects.ts`)
- `allBlogPosts` — Array of blog post metadata
- `getContentBySlug(slug: string)` — Returns the MDX component + frontmatter for a given slug

This is the single source of truth for all content metadata. `src/data/projects.ts` is removed.

### MDX Provider

A provider component wraps content pages and makes shared components (`HeroSection`, `OverviewTable`, `FeatureSection`, `ImageCarousel`) available to all MDX files without explicit imports. `OverviewTable` receives frontmatter via React context so it renders with zero props in MDX.

### Routing

Replace the 5 hardcoded project routes in `App.tsx` with:

- `/projects/:category/:slug` — Renders `ContentPage` which looks up the MDX content by slug
- `/blog/:slug` — Same `ContentPage`, filtered to blog content type

`ContentPage` is a generic renderer that:
1. Reads the slug from URL params
2. Looks up the corresponding MDX module via the content registry
3. Renders the MDX component wrapped in the MDX provider (which supplies shared components and frontmatter context)

### Build Integration

- **`@mdx-js/rollup`** — Vite plugin that compiles `.mdx` files to React components at build time
- **`@mdx-js/react`** — Provides the `MDXProvider` for component injection
- **TypeScript declarations** — `.mdx` module declarations so TypeScript understands MDX imports

### Components Modified

- **`OverviewTable`** — Add ability to read frontmatter from context (in addition to existing props, for backwards compatibility during migration)
- **`HeroSection`, `FeatureSection`, `ImageCarousel`** — No changes needed; they already accept the right props
- **`App.tsx`** — Replace hardcoded routes with dynamic routes
- **`Home.tsx`** — Import project list from content registry instead of `projects.ts`

## Migration Strategy

### Phase 1: Add MDX tooling
- Install `@mdx-js/rollup`, `@mdx-js/react`
- Configure Vite plugin in `vite.config.ts`
- Add `.mdx` TypeScript declarations

### Phase 2: Build content infrastructure
- Create `src/content/index.ts` (content registry with `import.meta.glob`)
- Create `src/pages/ContentPage.tsx` (generic MDX renderer)
- Create MDX provider with shared components
- Update `OverviewTable` to support reading from frontmatter context

### Phase 3: Convert RTCC (most complex page)
- Create `src/content/projects/rtcc.mdx` with full frontmatter and MDX body
- Verify all content renders correctly: rich formatting, image carousels, nested lists, kbd tags

### Phase 4: Convert remaining projects
- Create `.mdx` files for DiceRoll, InfiniteDiver, LetsPlay, Scraper
- These are simple (~45 lines each), straightforward conversions

### Phase 5: Replace projects.ts
- Switch `Home.tsx` and all consumers to use the content registry
- Remove `src/data/projects.ts`

### Phase 6: Update routing
- Replace hardcoded routes in `App.tsx` with dynamic `/projects/:category/:slug` route
- Remove old `src/pages/projects/*.tsx` files

### Phase 7: Add blog support
- Create `src/content/blog/` directory
- Add `/blog/:slug` route
- Add a `/blog` listing page that shows all blog posts (same pattern as Home page project cards)

## Verification

1. **Dev server** — Run `npm run dev`, navigate to each project page, verify content renders identically to current hardcoded pages
2. **RTCC specifically** — Check all 7 sections, both image carousels, rich formatting (bold, kbd, code, links, nested lists)
3. **Home page** — Verify project cards still display correctly with data from content registry
4. **New content test** — Create a dummy `.mdx` file, confirm it appears automatically without any code changes
5. **Build** — Run `npm run build` to verify no TypeScript or build errors
6. **Blog** — Create a test blog post `.mdx`, navigate to `/blog/:slug`, verify rendering

## Dependencies

New packages:
- `@mdx-js/rollup` — Vite MDX plugin
- `@mdx-js/react` — MDX React provider
- `remark-frontmatter` — Parse YAML frontmatter in MDX
- `remark-mdx-frontmatter` — Export frontmatter as JS from MDX
