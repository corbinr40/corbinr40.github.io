# Content Editor Design

## Context

The portfolio site now uses MDX files with YAML frontmatter for project pages and blog posts. Creating content currently means hand-writing `.mdx` files and manually placing images in the correct folders. This is error-prone and time-consuming. A GUI editor will make it easy to create, preview, and publish content without touching code.

## Overview

A block-based content editor integrated into the portfolio site at `/editor` (hidden from search engines). The editor generates valid MDX files from a form-based UI, provides live preview using the actual site components, and can publish directly to the GitHub repo via the Contents API. Drafts are saved locally in the browser with JSON export/import for backup.

## Hosting & Architecture

- **Integrated route** at `/editor` in the existing React app
- **Lazy-loaded** — editor code split from the main site bundle so visitors don't download it
- **`<meta name="robots" content="noindex">`** — prevents search engines from indexing the editor
- **Client-side only** — no backend; GitHub API calls made directly from the browser
- **Shares site components** — HeroSection, FeatureSection, OverviewTable, ImageCarousel reused in the preview for pixel-accurate rendering

## Editor Layout

### Wide screens (>= 1200px): Side-by-side
- **Left panel (50%):** Editor — frontmatter form + block builder
- **Right panel (50%):** Live preview with device-width toggle

### Narrow screens (< 1200px): Tabbed
- **Edit tab:** Full-width editor
- **Preview tab:** Full-width preview with device-width toggle

### Header bar (always visible)
- Content type toggle: Project / Blog Post
- Draft controls: Save, Load (opens draft list), Export JSON, Import JSON
- Publish controls: Publish to GitHub, Download ZIP
- Settings gear: GitHub token configuration

## Frontmatter Form

Fields adapt based on content type selection.

### Project fields
| Field | Type | Required |
|-------|------|----------|
| Title | text input | yes |
| Slug/ID | text input (auto-generated from title, editable) | yes |
| Short Description | textarea | yes |
| Category | select: programs, games, 3dprojects, demos | yes |
| Dev Types | multi-select: personal, university, industry, jam | yes |
| Skills/Tags | tag input (comma-separated) | yes |
| Card Image | file upload | no |
| Status | select: completed, ongoing, coming-soon | yes |
| Type | text input (e.g., "University/Project") | no |
| Duration | text input (e.g., "9 Months") | no |
| Software | text input (e.g., "Visual Studio Code") | no |
| Languages | text input (e.g., "Python, OpenCV") | no |
| Available On | text input OR label+href pair (toggle) | no |
| Visible | checkbox (default: true) | yes |

### Blog post fields
| Field | Type | Required |
|-------|------|----------|
| Title | text input | yes |
| Slug/ID | text input (auto-generated from title, editable) | yes |
| Short Description | textarea | yes |
| Skills/Tags | tag input | no |
| Card Image | file upload | no |
| Visible | checkbox (default: true) | yes |

## Block Builder

Content is assembled from typed blocks. Each block has:
- A header with: block type label, drag handle for reordering, collapse/expand toggle, delete button
- Inline editing form specific to its type

### "Add Block" menu
A button at the bottom of the block list that opens a categorized picker:

**Layout blocks:**
- Hero Section
- Overview Table
- Feature Section

**Media blocks:**
- Image Carousel
- Image + Paragraph (Left)
- Image + Paragraph (Right)
- Video Embed

**Text blocks:**
- Code Block
- Callout Box
- Quote Block

### Block type specifications

#### Hero Section
- Title: text input
- Paragraphs: list of textarea fields (add/remove paragraphs)
- Hero Image: file upload (optional)
- Image Alt Text: text input

#### Overview Table
- No fields — auto-populated from frontmatter
- Toggle to include/exclude from content

#### Feature Section
- Section Title: text input (default: "Features")
- Side Image: file upload (optional) + alt text + caption
- Content: rich text editor (bold, italic, underline, links, ordered/unordered lists, inline code, kbd tags)

#### Image Carousel
- Carousel ID: auto-generated, editable
- Images: list of items, each with:
  - Image: file upload
  - Alt text: text input
  - Title: text input (optional)
  - Caption: text input (optional)
  - Add/remove/reorder controls

#### Image + Paragraph (Left / Right)
- Image: file upload + alt text + caption
- Content: rich text editor
- Variant: left or right (determines image placement)

#### Code Block
- Language: select dropdown (javascript, python, typescript, csharp, html, css, bash, etc.)
- Code: monospace textarea

#### Video Embed
- URL: text input (YouTube or Vimeo URL)
- Auto-extracts embed URL from standard YouTube/Vimeo link formats

#### Callout Box
- Type: select (info, warning, tip, note) — each with distinct color/icon
- Content: rich text editor

#### Quote Block
- Quote: textarea
- Attribution: text input (optional)

## Rich Text Editor

Used within FeatureSection, Image+Paragraph, and Callout blocks. Supports:
- Bold, italic, underline
- Links (href + text)
- Ordered and unordered lists
- Inline code
- Kbd tags (keyboard keys)
- Line breaks

Implementation: Use TipTap (ProseMirror-based, `@tiptap/react` + `@tiptap/starter-kit`). Output format: HTML strings that are embedded directly inside JSX within the MDX file (e.g., `<p>Some <b>bold</b> text with a <a href="...">link</a></p>`). This matches the existing content format in the current MDX files.

## Live Preview

- Renders content using the actual site components: HeroSection, FeatureSection, OverviewTable, ImageCarousel
- New block types (CodeBlock, VideoEmbed, CalloutBox, QuoteBlock, ImageParagraph) need corresponding React components added to the site for both preview and rendering
- Images rendered from local blob URLs during editing
- Device-width toggle: Desktop (100%), Tablet (768px), Mobile (375px) — resizes the preview container within an iframe or constrained div
- Updates live as content changes (debounced to avoid excessive re-renders)

## Image Handling

- Images uploaded via file picker or drag-and-drop onto image fields
- Stored in IndexedDB alongside the draft as Blobs
- Previewed from local blob URLs
- On publish: organized into `public/assets/pageAssets/{slug}/` folder structure
- On ZIP export: included in the correct directory structure

## Publishing (GitHub API)

### Setup
- User provides a GitHub Personal Access Token (PAT) with `repo` scope
- Token stored in browser localStorage
- Repo owner/name configurable (default: `corbinr40/corbinr40.github.io`)
- Target branch configurable (default: `main`)

### Publish flow
1. Validate: all required frontmatter fields filled, at least one content block
2. Generate `.mdx` file content from blocks
3. For each image referenced in content:
   - Convert to base64
   - `PUT /repos/{owner}/{repo}/contents/public/assets/pageAssets/{slug}/{filename}` (creates or updates)
4. `PUT /repos/{owner}/{repo}/contents/src/content/projects/{slug}.mdx` (or `blog/{slug}.mdx`)
5. Show success message with link to the GitHub commit
6. GitHub Actions auto-triggers site rebuild

### Error handling
- Token validation check before publish attempt
- File conflict detection (file already exists — offer to overwrite or rename)
- Network error retry with user notification
- Progress indicator for multi-file uploads

## ZIP Download (Fallback)

Downloads a ZIP with structure:
```
{slug}/
  src/content/projects/{slug}.mdx   (or blog/)
  public/assets/pageAssets/{slug}/
    image1.png
    image2.jpg
```

User extracts and copies files into the repo manually.

## Draft Management

### Auto-save
- Saves to IndexedDB every 30 seconds and on every block add/remove/reorder
- Stores: frontmatter data, block list with content, image blobs, last modified timestamp

### Draft list
- Shows all saved drafts with: title, content type (project/blog), last modified date
- Load, delete, or export individual drafts

### Export/Import
- "Export Draft" downloads a `.json` file containing all content + base64-encoded images
- "Import Draft" loads a `.json` file into the editor, restoring all content and images
- JSON format is self-contained — can be shared between machines

## MDX Generation

The editor converts the block list into valid MDX that matches the existing content file format:

1. YAML frontmatter generated from the form fields
2. For blocks with exported data (e.g., ImageCarousel image arrays), generate `export const` statements
3. Each block converted to its corresponding JSX:
   - Wrapped in `<div className="section-wrapper">` where appropriate
   - Rich text content output as HTML within JSX
   - Image paths reference `public/assets/pageAssets/{slug}/` locations

## New Components Needed

These components must be added to the main site to support the new block types (used in both preview and published pages):

| Component | Props |
|-----------|-------|
| `CodeBlock` | `language: string`, `code: string` |
| `VideoEmbed` | `url: string` |
| `CalloutBox` | `type: 'info' \| 'warning' \| 'tip' \| 'note'`, `children: ReactNode` |
| `QuoteBlock` | `quote: string`, `attribution?: string` |
| `ImageParagraph` | `imageSrc: string`, `imageAlt: string`, `imageCaption?: string`, `side: 'left' \| 'right'`, `children: ReactNode` |

These must also be registered in the `MDXProvider` components map in `ContentPage.tsx`.

## File Structure

```
src/
  pages/
    Editor.tsx              # Main editor page (lazy-loaded)
  components/
    editor/
      EditorHeader.tsx      # Header bar with controls
      FrontmatterForm.tsx   # Frontmatter field form
      BlockBuilder.tsx      # Block list with drag-and-drop
      BlockPicker.tsx       # "Add Block" menu
      blocks/
        HeroBlock.tsx       # Hero section editor
        OverviewBlock.tsx   # Overview table toggle
        FeatureBlock.tsx    # Feature section editor
        CarouselBlock.tsx   # Image carousel editor
        ImageParaBlock.tsx  # Image + paragraph editor
        CodeBlock.tsx       # Code block editor
        VideoBlock.tsx      # Video embed editor
        CalloutBlock.tsx    # Callout box editor
        QuoteBlock.tsx      # Quote block editor
      RichTextEditor.tsx    # Shared rich text editor component
      PreviewPanel.tsx      # Live preview renderer
      DraftManager.tsx      # Draft list and management UI
      GitHubPublisher.tsx   # GitHub API publish logic
      ZipExporter.tsx       # ZIP download logic
    CodeBlock.tsx           # Site component for rendering code blocks
    VideoEmbed.tsx          # Site component for rendering video embeds
    CalloutBox.tsx          # Site component for rendering callout boxes
    QuoteBlock.tsx          # Site component for rendering quote blocks
    ImageParagraph.tsx      # Site component for rendering image+paragraph
  hooks/
    useDrafts.ts            # IndexedDB draft CRUD operations
    useGitHubApi.ts         # GitHub Contents API wrapper
  types/
    editor.ts               # Block type definitions, draft schema
```

## Dependencies

New packages:
- `@tiptap/react` + `@tiptap/starter-kit` — rich text editor (or `lexical` as alternative)
- `jszip` — ZIP file generation
- `dnd-kit` or `@hello-pangea/dnd` — drag-and-drop block reordering

## Verification

1. Open `/editor`, create a project with all block types, verify preview matches
2. Export as ZIP, extract, copy files to repo, build, verify page renders
3. Set up GitHub token, publish a test project, verify commit appears and site rebuilds
4. Save a draft, close browser, reopen, load draft — verify all content and images restored
5. Export draft as JSON, import on another browser, verify identical
6. Test on narrow screen — verify tabbed mode works
7. Test device-width toggle in preview
8. Navigate to `/editor` with no token — verify publish is disabled with clear messaging
