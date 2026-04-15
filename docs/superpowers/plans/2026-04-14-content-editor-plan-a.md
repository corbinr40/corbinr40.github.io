# Content Editor — Plan A: Editor Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the editor shell, frontmatter form, block system with drag-and-drop, editors for the 4 existing block types (Hero, Overview, Feature, Carousel), MDX generation, and live preview.

**Architecture:** Lazy-loaded `/editor` route in the existing React app. Editor state managed via `useReducer`. Blocks are typed objects in an array. MDX generation converts block state to valid `.mdx` file content. Preview renders the generated content using the actual site components.

**Tech Stack:** React 19, TypeScript, Bootstrap 5, TipTap (rich text), @dnd-kit (drag-and-drop)

**Full spec:** `docs/superpowers/specs/2026-04-14-content-editor-design.md`

---

## Summary (10 Tasks)

### Task 1: Install Dependencies & Add Editor Route
- Install TipTap and dnd-kit packages
- Create placeholder Editor.tsx
- Add lazy-loaded /editor route to App.tsx with Suspense

### Task 2: Define Editor Types
- Create `src/types/editor.ts` with block types, frontmatter types, editor state, actions, and helpers

### Task 3: Build Editor State Reducer & Main Page Layout
- EditorHeader component with content type toggle and action buttons
- Editor page with useReducer, responsive side-by-side/tabbed layout, noindex meta

### Task 4: Frontmatter Form
- FrontmatterForm component with project/blog field variants
- Auto-slug generation from title

### Task 5: Block Picker & Block Builder Shell
- BlockPicker with categorized block type menu
- BlockBuilder with dnd-kit drag-and-drop, collapse/expand, delete

### Task 6: Rich Text Editor (TipTap)
- RichTextEditor component with formatting toolbar (bold, italic, underline, code, lists, links)

### Task 7: Block Editors — Hero, Overview, Feature, Carousel
- HeroBlock: title, paragraphs list, image fields
- OverviewBlock: enable/disable toggle
- FeatureBlock: title, image fields, TipTap rich text content
- CarouselBlock: image list with add/remove/edit

### Task 8: MDX Generator
- `generateMdx()` function converting editor state to valid .mdx content
- YAML frontmatter generation, carousel exports, block JSX generation

### Task 9: Live Preview Panel
- PreviewPanel using actual site components (HeroSection, OverviewTable, etc.)
- Device-width toggle (desktop/tablet/mobile)
- ContentProvider integration for OverviewTable context

### Task 10: MDX Export Button
- Download generated .mdx file from header button
- Wire generateMdx into the download handler

## Key Implementation Details

The detailed implementation with complete code for every step is available in the approved spec. Each task follows this pattern:
1. Create/modify files with the specified code
2. Verify in browser at `http://localhost:5173/editor`
3. Commit

## Files Created
- `src/types/editor.ts` — Block/frontmatter/state type definitions
- `src/pages/Editor.tsx` — Main editor page with useReducer
- `src/components/editor/EditorHeader.tsx` — Header bar
- `src/components/editor/FrontmatterForm.tsx` — Metadata form
- `src/components/editor/BlockBuilder.tsx` — Block list with drag-and-drop
- `src/components/editor/BlockPicker.tsx` — Add block menu
- `src/components/editor/RichTextEditor.tsx` — TipTap wrapper
- `src/components/editor/PreviewPanel.tsx` — Live preview
- `src/components/editor/mdxGenerator.ts` — MDX generation
- `src/components/editor/blocks/HeroBlock.tsx`
- `src/components/editor/blocks/OverviewBlock.tsx`
- `src/components/editor/blocks/FeatureBlock.tsx`
- `src/components/editor/blocks/CarouselBlock.tsx`

## Files Modified
- `src/App.tsx` — Add lazy-loaded /editor route

## New Dependencies
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-underline`
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
