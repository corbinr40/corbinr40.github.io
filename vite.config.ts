import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import sitemap from './vite-plugin-sitemap'
import drafts from './vite-plugin-drafts'
import rss from './vite-plugin-rss'

export default defineConfig({
  plugins: [
    // drafts() is enforce:'pre' - stubs visible:false MDX in prod builds
    drafts(),
    // mdx() must precede react() so .mdx files are transformed before JSX processing
    mdx({
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
    react(),
    sitemap(),
    rss(),
  ],
  base: '/',
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
      },
    },
  },
})
