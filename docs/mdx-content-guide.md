# MDX Content Guide

This document describes exactly how to create `.mdx` content files for corbinr40.github.io. Follow these rules precisely - the site's build system and renderer expect this exact format.

## File Location

- **Projects:** `src/content/projects/{slug}.mdx`
- **Blog posts:** `src/content/blog/{slug}.mdx`

The filename (minus `.mdx`) becomes the URL slug. Use lowercase, hyphens only, no spaces: `my-project-name.mdx`.

No other files need to be modified. The content registry auto-discovers new `.mdx` files at build time.

## File Structure

Every `.mdx` file has exactly two parts:

1. **YAML frontmatter** between `---` delimiters
2. **MDX body** - JSX components wrapped in `<div className="section-wrapper">`

There is NO markdown in the body. All content uses JSX components. Do NOT use markdown headings (`##`), paragraphs, or lists directly - they must be inside a component like `<FeatureSection>`.

---

## Part 1: Frontmatter

### Project Frontmatter

```yaml
---
id: "my-project"
title: "My Project Title"
description: "A short description shown on project cards and in SEO meta tags. Keep under 160 characters for SEO."
category: "programs"
devTypes:
  - "personal"
skills:
  - "python"
  - "react"
image: "/unsplash-photo-2.jpg"
status: "completed"
type: "University/Project"
duration: "9 Months"
software: "Visual Studio Code"
languages: "Python, OpenCV"
availableOn: "GitHub"
contentType: "project"
visible: true
---
```

**Field reference:**

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `id` | Yes | string | Unique identifier, matches the filename slug |
| `title` | Yes | string | Display title |
| `description` | Yes | string | Short description for cards and SEO (< 160 chars) |
| `category` | Yes | string | One of: `"programs"`, `"games"`, `"3dprojects"`, `"demos"` |
| `devTypes` | Yes | string[] | One or more of: `"personal"`, `"university"`, `"industry"`, `"jam"` |
| `skills` | Yes | string[] | Skill/technology tags (lowercase): `"python"`, `"react"`, `"unity"`, `"csharp"`, `"ts"`, `"ue"`, `"blender"`, `"substance"`, etc. |
| `image` | No | string | Card thumbnail image path (relative to `public/`) |
| `status` | Yes | string | One of: `"completed"`, `"ongoing"`, `"coming-soon"` |
| `type` | No | string | Free text, e.g. `"University/Project"`, `"Personal/Game"`, `"Game Jam"` |
| `duration` | No | string | Free text, e.g. `"9 Months"`, `"~2 months"`, `"1 Week"` |
| `software` | No | string | Tools used, e.g. `"Visual Studio Code"`, `"Unity, Xcode"` |
| `languages` | No | string | Languages/frameworks, e.g. `"Python, OpenCV"`, `"C#"` |
| `availableOn` | No | string or object | Where the project is available. Plain string: `"GitHub"`. Or an object with a link: see below. |
| `contentType` | Yes | string | Must be `"project"` |
| `visible` | Yes | boolean | `true` to show in listings, `false` to hide |

**`availableOn` as a link:**
```yaml
availableOn:
  label: "GitHub"
  href: "https://github.com/username/repo"
```

### Blog Post Frontmatter

```yaml
---
id: "my-blog-post"
title: "My Blog Post Title"
description: "A short description shown on the blog listing page."
skills:
  - "react"
  - "ts"
image: "/assets/icon256.png"
contentType: "blog"
visible: true
date: "2026-04-15"
tags:
  - "web development"
  - "react"
---
```

**Additional blog fields:**

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `contentType` | Yes | string | Must be `"blog"` |
| `date` | Yes | string | ISO date format: `"YYYY-MM-DD"` |
| `tags` | No | string[] | Tags for filtering on the blog listing page |

Blog posts do NOT have: `category`, `devTypes`, `status`, `type`, `duration`, `software`, `languages`, `availableOn`.

---

## Part 2: MDX Body

The body consists of JSX components. Every visual block MUST be wrapped in `<div className="section-wrapper">` for consistent spacing.

### CRITICAL RULES

1. **Always use `className` not `class`** - this is JSX, not HTML
2. **Every block wrapped in `<div className="section-wrapper">`** - except `ImageCarousel` which can be inline inside a `FeatureSection`
3. **Self-closing tags must use `/>` syntax** - `<br />` not `<br>`, `<img ... />` not `<img ...>`
4. **String props use double quotes** - `title="My Title"`
5. **JavaScript expression props use curly braces** - `paragraphs={["Text"]}`, `images={varName}`
6. **HTML entities in JSX** - use unicode or `{' '}` for special characters, not `&amp;` etc.
7. **No raw markdown** - no `##`, `**bold**`, `- list item`. Use HTML tags inside components: `<b>`, `<ul><li>`, `<p>`

---

## Available Components

### HeroSection

The page hero. Should be the FIRST block on every page.

```jsx
<div className="section-wrapper">
  <HeroSection
    title="Project Title"
    paragraphs={["First paragraph of introduction text.", "Optional second paragraph."]}
    imageSrc="/assets/pageAssets/slug/hero.png"
    imageAlt="Description of the image"
  />
</div>
```

| Prop | Required | Type | Description |
|------|----------|------|-------------|
| `title` | Yes | string | Page heading |
| `paragraphs` | Yes | string[] | Array of paragraph strings - use `{["text"]}` syntax |
| `imageSrc` | No | string | Hero image path |
| `imageAlt` | No | string | Image alt text |

### OverviewTable

Project metadata table. **Only for projects, not blog posts.** Reads values automatically from frontmatter - no props needed.

```jsx
<div className="section-wrapper">
  <OverviewTable />
</div>
```

Should be the SECOND block on project pages (after HeroSection).

### FeatureSection

A titled content section. This is the main content block - use it for every section of your page.

```jsx
<div className="section-wrapper">
  <FeatureSection title="Features">
    <p>Paragraph of text with <b>bold</b>, <i>italic</i>, and <a href="https://example.com"><u>links</u></a>.</p>
    <ul>
      <li>Bullet point one</li>
      <li>Bullet point two</li>
    </ul>
  </FeatureSection>
</div>
```

With a side image:

```jsx
<div className="section-wrapper">
  <FeatureSection
    title="Getting Started"
    imageSrc="/assets/pageAssets/slug/screenshot.png"
    imageAlt="Screenshot description"
    imageCaption="Optional caption text"
  >
    <p>Content goes here...</p>
  </FeatureSection>
</div>
```

| Prop | Required | Type | Description |
|------|----------|------|-------------|
| `title` | No | string | Section heading (defaults to "Features") |
| `imageSrc` | No | string | Side image path |
| `imageAlt` | No | string | Image alt text |
| `imageCaption` | No | string | Caption below image |
| `children` | Yes | JSX | Section content - use `<p>`, `<ul>`, `<b>`, `<i>`, `<a>`, `<code>`, `<kbd>` etc. |

**Content formatting inside FeatureSection:**

```jsx
{/* Bold, italic, underline, code */}
<p>Some <b>bold</b>, <i>italic</i>, <u>underline</u>, and <code>inline code</code> text.</p>

{/* Links */}
<p>Visit the <a href="https://example.com"><u>documentation</u></a> for more.</p>

{/* Term-description list (3-column aligned) */}
<DescList items={[
  { term: "Feature one", desc: "Description of what it does" },
  { term: "Feature two", desc: "Another capability" },
]} />

{/* Keyboard shortcut list */}
<DescList items={[
  { term: "Ctrl+Z", desc: "Undo", termTag: "kbd" },
  { term: "Ctrl+S", desc: "Save", termTag: "kbd" },
]} />

{/* Simple bullet list (no special formatting) */}
<ul>
  <li>Simple bullet point one</li>
  <li>Simple bullet point two</li>
</ul>

{/* Ordered list */}
<ol>
  <li>Step one</li>
  <li>Step two</li>
</ol>

{/* Keyboard keys (inline) */}
<p>Press <kbd>Ctrl</kbd> + <kbd>Z</kbd> to undo.</p>

{/* Code block (inline) */}
<p>Run <code>npm install</code> to install.</p>

{/* Line break */}
<p>Line one<br />Line two</p>

**Note:** For term-description pairs, use the `<DescList>` component instead of manually building list items with separator spans.

{/* Styled list container (centered with justified text) */}
<div className="listContainer">
  <ul className="list">
    <li><a href="https://example.com"><u>Linked item</u></a></li>
  </ul>
</div>

{/* Justified text container */}
<div className="textContainer">
  <p>Long narrative paragraph...</p>
</div>
```

### DescList

A 3-column aligned list for term-description pairs. Uses CSS grid for perfect column alignment.

| Prop | Required | Type | Description |
|------|----------|------|-------------|
| `items` | Yes | array | Array of `{ term: string, desc: string, termTag?: 'b' \| 'kbd' }` objects |

Each item has:
- `term` — the bold label (left column, right-aligned)
- `desc` — the description (right column, left-aligned)
- `termTag` — optional, `'kbd'` for keyboard shortcuts, defaults to bold `<b>`

### ImageCarousel

A Bootstrap image carousel. Can be used as a standalone block or embedded inside a FeatureSection.

**Step 1:** Define images as an exported constant BEFORE the JSX body (after the frontmatter closing `---`):

```jsx
export const myImages = [
  {
    src: '/assets/pageAssets/slug/photo1.png',
    alt: 'Description of photo 1',
    title: 'Photo 1 Title',
    caption: 'Caption text for photo 1.',
  },
  {
    src: '/assets/pageAssets/slug/photo2.png',
    alt: 'Description of photo 2',
    title: 'Photo 2 Title',
    caption: 'Caption text for photo 2.',
  },
];
```

**Step 2:** Use the carousel component, referencing the variable:

```jsx
<ImageCarousel id="unique-carousel-id" images={myImages} />
```

| Prop | Required | Type | Description |
|------|----------|------|-------------|
| `id` | Yes | string | Unique ID for this carousel (no spaces, use hyphens) |
| `images` | Yes | array | Reference to the exported image array variable |

Each image object:

| Field | Required | Type |
|-------|----------|------|
| `src` | Yes | string |
| `alt` | Yes | string |
| `title` | No | string |
| `caption` | No | string |

**Embedding inside FeatureSection:**

```jsx
<div className="section-wrapper">
  <FeatureSection title="Hardware">
    <div className="textContainer">
      <p>Some text before the carousel...</p>
      <ImageCarousel id="hardware-photos" images={hardwareImages} />
      <p>Some text after the carousel...</p>
    </div>
  </FeatureSection>
</div>
```

### ImageParagraph

Image alongside text, with configurable left/right placement.

```jsx
<div className="section-wrapper">
  <ImageParagraph
    side="left"
    imageSrc="/assets/pageAssets/slug/photo.png"
    imageAlt="Photo description"
    imageCaption="Optional caption"
  >
    <p>Text content next to the image.</p>
  </ImageParagraph>
</div>
```

| Prop | Required | Type | Description |
|------|----------|------|-------------|
| `side` | Yes | string | `"left"` (image left, text right) or `"right"` (text left, image right) |
| `imageSrc` | Yes | string | Image path |
| `imageAlt` | Yes | string | Alt text |
| `imageCaption` | No | string | Caption below image |
| `children` | Yes | JSX | Text content |

### CodeBlock

Syntax-highlighted code snippet.

```jsx
<div className="section-wrapper">
  <CodeBlock language="python" code={`def hello():
    print("Hello, world!")`} />
</div>
```

| Prop | Required | Type | Description |
|------|----------|------|-------------|
| `language` | Yes | string | Language: `"javascript"`, `"typescript"`, `"python"`, `"csharp"`, `"html"`, `"css"`, `"bash"`, `"json"` |
| `code` | Yes | string | The code content. Use template literals `` {`code here`} `` for multi-line. |

### VideoEmbed

Responsive YouTube or Vimeo embed.

```jsx
<div className="section-wrapper">
  <VideoEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
</div>
```

| Prop | Required | Type | Description |
|------|----------|------|-------------|
| `url` | Yes | string | YouTube or Vimeo URL (standard watch/share URLs) |

### CalloutBox

Info, warning, tip, or note callout.

```jsx
<div className="section-wrapper">
  <CalloutBox type="info">
    <p>This is an informational callout.</p>
  </CalloutBox>
</div>
```

| Prop | Required | Type | Description |
|------|----------|------|-------------|
| `type` | Yes | string | `"info"`, `"warning"`, `"tip"`, `"note"` |
| `children` | Yes | JSX | Callout content |

### QuoteBlock

Styled blockquote with optional attribution.

```jsx
<div className="section-wrapper">
  <QuoteBlock
    quote="The best way to predict the future is to invent it."
    attribution="Alan Kay"
  />
</div>
```

| Prop | Required | Type | Description |
|------|----------|------|-------------|
| `quote` | Yes | string | The quote text |
| `attribution` | No | string | Who said it |

---

## Complete Project Example

```mdx
---
id: "my-project"
title: "My Awesome Project"
description: "A brief description of the project for cards and SEO."
category: "programs"
devTypes:
  - "personal"
skills:
  - "python"
  - "react"
image: "/unsplash-photo-2.jpg"
status: "completed"
type: "Personal/Project"
duration: "6 Months"
software: "VS Code, PyCharm"
languages: "Python, React"
availableOn:
  label: "GitHub"
  href: "https://github.com/user/repo"
contentType: "project"
visible: true
---

export const screenshotImages = [
  {
    src: '/assets/pageAssets/my-project/screenshot1.png',
    alt: 'Main dashboard view',
    title: 'Dashboard',
    caption: 'The main dashboard showing real-time data.',
  },
  {
    src: '/assets/pageAssets/my-project/screenshot2.png',
    alt: 'Settings panel',
    title: 'Settings',
    caption: 'Configuration options for the application.',
  },
];

<div className="section-wrapper">
  <HeroSection
    title="My Awesome Project"
    paragraphs={["A comprehensive description of what this project does and why it matters. This is the first thing visitors see."]}
    imageSrc="/assets/pageAssets/my-project/hero.png"
    imageAlt="Project hero image"
  />
</div>

<div className="section-wrapper">
  <OverviewTable />
</div>

<div className="section-wrapper">
  <FeatureSection title="Features">
    <p>This project includes several key features:</p>
    <DescList items={[
      { term: "Feature one", desc: "Description of what it does" },
      { term: "Feature two", desc: "Another capability" },
      { term: "Feature three", desc: "And one more" },
    ]} />
  </FeatureSection>
</div>

<div className="section-wrapper">
  <FeatureSection title="Screenshots">
    <div className="textContainer">
      <p>Here are some screenshots of the application in action:</p>
      <ImageCarousel id="project-screenshots" images={screenshotImages} />
    </div>
  </FeatureSection>
</div>

<div className="section-wrapper">
  <FeatureSection title="Technical Details">
    <p>The backend is built with <b>Python</b> using <b>FastAPI</b>, while the frontend uses <b>React</b> with <b>TypeScript</b>.</p>
    <CodeBlock language="python" code={`from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}`} />
    <p>The application uses a <b>PostgreSQL</b> database for persistent storage.</p>
  </FeatureSection>
</div>

<div className="section-wrapper">
  <CalloutBox type="tip">
    <p>Check out the <a href="https://github.com/user/repo"><u>GitHub repository</u></a> for the full source code and installation instructions.</p>
  </CalloutBox>
</div>
```

## Complete Blog Post Example

```mdx
---
id: "my-first-post"
title: "My First Blog Post"
description: "An introduction to my blog and what I plan to write about."
skills:
  - "react"
image: "/assets/icon256.png"
contentType: "blog"
visible: true
date: "2026-04-15"
tags:
  - "introduction"
  - "web development"
---

<div className="section-wrapper">
  <HeroSection
    title="My First Blog Post"
    paragraphs={["Welcome to my blog! Here I'll share thoughts on software development, game design, and 3D art."]}
  />
</div>

<div className="section-wrapper">
  <FeatureSection title="Why I Started Blogging">
    <p>I've been building things for years but rarely wrote about the process. This blog changes that.</p>
    <p>Writing about what I learn helps me <b>solidify my understanding</b> and hopefully helps others who are on a similar path.</p>
  </FeatureSection>
</div>

<div className="section-wrapper">
  <FeatureSection title="What to Expect">
    <p>I plan to write about:</p>
    <ul>
      <li>Project deep-dives and post-mortems</li>
      <li>Game development techniques and tools</li>
      <li>Web development with React and TypeScript</li>
      <li>3D modelling workflows in Blender</li>
    </ul>
  </FeatureSection>
</div>

<div className="section-wrapper">
  <QuoteBlock
    quote="The only way to do great work is to love what you do."
    attribution="Steve Jobs"
  />
</div>
```

## Image Paths

Images go in `public/assets/pageAssets/{slug}/`. Reference them with absolute paths from the public root:

```
/assets/pageAssets/my-project/hero.png
/assets/pageAssets/my-project/screenshot1.png
```

For card thumbnail images (the `image` field in frontmatter), use existing placeholder images or add your own to `public/`:

```
/unsplash-photo-1.jpg
/unsplash-photo-2.jpg
/unsplash-photo-3.jpg
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `class` instead of `className` | Always use `className` in JSX |
| Forgetting `section-wrapper` div | Every block needs `<div className="section-wrapper">` |
| Using markdown syntax (`## Heading`) | Use `<FeatureSection title="Heading">` instead |
| Missing quotes around prop strings | `title="My Title"` not `title=My Title` |
| Using `<br>` instead of `<br />` | Self-closing tags need the slash |
| Putting `OverviewTable` in a blog post | Only projects use `OverviewTable` |
| Forgetting `contentType` in frontmatter | Must be `"project"` or `"blog"` |
| Non-unique carousel IDs | Each `ImageCarousel` on a page needs a unique `id` |
| Referencing image variable before export | `export const images = [...]` must come BEFORE the JSX that uses it |
