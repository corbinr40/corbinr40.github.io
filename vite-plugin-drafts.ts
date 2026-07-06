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
      if (!id.split('?')[0].endsWith('.mdx')) return null;
      if (!/visible:\s*false/.test(code)) return null;
      // Replace content with a minimal default export only.
      // Frontmatter will be undefined (not exported), which src/content/index.ts filters out.
      return {
        code: 'export default function Draft() { return null; }',
        map: null
      };
    },
  };
}
