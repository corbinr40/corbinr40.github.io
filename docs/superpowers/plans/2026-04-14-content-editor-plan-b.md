# Content Editor — Plan B: New Block Types

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 new block types (ImageParagraph, CodeBlock, VideoEmbed, CalloutBox, QuoteBlock) to both the site renderer and the editor.

**Architecture:** Each block type needs: (1) a site component for rendering published pages, (2) a block editor for the editor UI, (3) type definitions, (4) integration into BlockPicker, BlockBuilder, PreviewPanel, mdxGenerator, and ContentPage's MDXProvider.

**Tech Stack:** React 19, TypeScript, Bootstrap 5

---

## Summary (4 Tasks)

### Task 1: Add new block type definitions
- Add 5 new interfaces to editor.ts, update BlockData union, BlockType, add to TYPE_LABELS

### Task 2: Create 5 site components
- CodeBlock, VideoEmbed, CalloutBox, QuoteBlock, ImageParagraph
- Register all in ContentPage.tsx MDXProvider

### Task 3: Create 5 block editors + integrate into BlockBuilder/BlockPicker
- Block editor for each type
- Add to BlockPicker options, BlockBuilder switch, TYPE_LABELS

### Task 4: Integrate into PreviewPanel and mdxGenerator
- Add rendering for new blocks in PreviewPanel
- Add MDX generation for new blocks in mdxGenerator
