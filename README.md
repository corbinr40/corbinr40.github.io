# corbinr40.github.io

Personal portfolio site for Corbin Richardson — software developer, game dev, and 3D artist.

**Live site:** https://corbinr40.github.io

## Tech Stack

- **React 19** + **TypeScript** — UI framework
- **Vite 6** — Build tool
- **Bootstrap 5** + **SCSS** — Styling with light/dark theme support
- **MDX** — Content format (Markdown + JSX)
- **GitHub Pages** — Hosting via GitHub Actions

## Content System

Content is authored as `.mdx` files with YAML frontmatter. Adding a new project or blog post means creating one file — no routing or data file changes needed.

```
src/content/
  projects/    # Project pages (e.g., rtcc.mdx, diceroll.mdx)
  blog/        # Blog posts
```

The content registry (`src/content/index.ts`) auto-discovers all MDX files at build time via Vite's `import.meta.glob`.

### Available Block Types

MDX files can use these components (injected via MDXProvider):

| Component | Purpose |
|-----------|---------|
| `HeroSection` | Page hero with title, paragraphs, optional image |
| `OverviewTable` | Project metadata table (reads from frontmatter context) |
| `FeatureSection` | Named content section with optional side image |
| `ImageCarousel` | Bootstrap image carousel |
| `ImageParagraph` | Image + text with left/right layout |
| `CodeBlock` | Syntax-highlighted code snippet |
| `VideoEmbed` | YouTube/Vimeo responsive embed |
| `CalloutBox` | Info/warning/tip/note alert box |
| `QuoteBlock` | Styled blockquote with attribution |

## Content Editor

A GUI editor is available at `/editor` (hidden from search engines). Features:

- Block-based editing with drag-and-drop reordering
- Rich text editing (TipTap)
- Image upload with drag-and-drop
- Live preview using actual site components
- Device-width toggle (desktop/tablet/mobile)
- Draft management (auto-save to IndexedDB, JSON export/import)
- Publish directly to GitHub via the Contents API
- Import existing MDX files from the repo or local files
- Undo/redo with keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)

## Development

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Type-check + production build
npm run preview    # Preview production build
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`) which builds and deploys to GitHub Pages.

## Project Structure

```
src/
  components/         # Reusable React components
    editor/           # Content editor components
      blocks/         # Block-specific editor UIs
  content/            # MDX content files
    projects/         # Project pages
    blog/             # Blog posts
  context/            # React contexts (Theme, Content)
  hooks/              # Custom hooks (drafts, GitHub API, toast, undo)
  pages/              # Page components (Home, Search, Editor, etc.)
  styles/             # SCSS (variables, base, components, utilities)
  types/              # TypeScript type definitions
public/               # Static assets (images, favicons)
```
