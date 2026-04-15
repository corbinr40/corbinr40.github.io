# Content Editor — Plan D: MDX Import + Image Upload

**Goal:** Allow importing existing .mdx files into the editor for editing, and add drag-and-drop image upload with local preview and inclusion in publish/export.

**Architecture:** An MDX parser converts .mdx file content back into EditorState. Image uploads stored as blob URLs in memory (and base64 in drafts). Image fields get a file picker alongside the URL input. Uploaded images included in ZIP export and GitHub publish.

---

## Summary (5 Tasks)

### Task 1: MDX Parser
- Create `src/components/editor/mdxParser.ts`
- Parse YAML frontmatter → Frontmatter type
- Parse exported const arrays → carousel image data
- Parse JSX blocks → Block[] array
- Handle all 10 block types

### Task 2: Import UI
- Add "Import MDX" option to EditorHeader
- File picker that reads .mdx file, parses it, dispatches LOAD_STATE
- Error handling for invalid files

### Task 3: Image Upload Component
- Create reusable ImageUpload component with file picker + drag-and-drop
- Shows preview when image is uploaded or URL is provided
- Stores uploaded files in a Map<string, File> managed at Editor level
- Falls back to URL text input

### Task 4: Wire ImageUpload into all image-bearing blocks
- Replace text inputs in HeroBlock, CarouselBlock, ImageParaBlock, FrontmatterForm
- Pass image store from Editor through BlockBuilder

### Task 5: Include images in publish and ZIP export
- Update GitHub publisher to upload image files alongside MDX
- Update ZIP exporter to include images in correct folders
