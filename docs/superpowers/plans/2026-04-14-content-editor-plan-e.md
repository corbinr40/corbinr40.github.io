# Content Editor — Plan E: Blog Enhancements

**Goal:** Make the blog system fully functional with date field, tags, improved listing page (sorting, filtering, card images), and RSS feed.

---

## Summary (4 Tasks)

### Task 1: Add date and tags to blog frontmatter
- Add `date` (string) and `tags` (string[]) to BlogFrontmatter in editor types
- Add date picker and tags input to FrontmatterForm for blog mode
- Update ContentFrontmatter interface to include date and tags
- Update content registry to expose date/tags
- Update mdxGenerator and mdxParser for new fields

### Task 2: Enhance BlogList page
- Sort posts by date (newest first)
- Show date, tags, and card image on each post card
- Add tag filter chips at the top
- Better card design with image, date, tags, description

### Task 3: Add blog navigation to site
- Add "Blog" link to the site navbar/Layout
- Add prev/next post navigation at the bottom of blog posts

### Task 4: RSS feed generation
- Create a build-time script or component that generates RSS XML
- Include in public/ folder via Vite plugin or build step
