const site = new URL('https://mdxjs.com')
const git = new URL('../', import.meta.url)
const gh = new URL('https://github.com/mdx-js/mdx/')

export const config = {
  author: 'MDX contributors',
  color: '#010409',
  gh,
  ghBlob: new URL('blob/main/', gh),
  ghTree: new URL('tree/main/', gh),
  git,
  input: new URL('docs/', git),
  oc: new URL('https://opencollective.com/unified'),
  output: new URL('public/', git),
  site,
  tags: ['mdx', 'markdown', 'jsx', 'oss', 'react'],
  title: 'MDX'
}

/** @type {Record<string, string>} */
export const redirect = {
  '/about/index.html': '/community/about/',
  '/advanced/index.html': '/guides/',
  '/advanced/api/index.html': '/packages/mdx/#api',
  '/advanced/ast/index.html': '/packages/remark-mdx/#syntax-tree',
  '/advanced/components/index.html': '/docs/using-mdx/',
  '/advanced/contributing/index.html': '/community/contribute/',
  '/advanced/custom-loader/index.html': '/guides/frontmatter/',
  '/advanced/retext-plugins/index.html': '/docs/extending-mdx/#using-plugins',
  '/advanced/plugins/index.html': '/docs/extending-mdx/',
  '/advanced/runtime/index.html': '/packages/mdx/#evaluatefile-options',
  '/advanced/specification/index.html': '/packages/remark-mdx/#syntax-tree',
  '/advanced/sync-api/index.html': '/packages/mdx/#api',
  '/advanced/transform-content/index.html': '/packages/remark-mdx/',
  '/advanced/typescript/index.html': '/docs/getting-started/#types',
  '/advanced/writing-a-plugin/index.html': '/guides/frontmatter/',
  '/contributing/index.html': '/community/contribute/',
  '/editor-plugins/index.html': '/docs/getting-started/#editor',
  '/editors/index.html': '/docs/getting-started/#editor',
  '/getting-started/create-react-app/index.html': '/docs/getting-started/#vite',
  '/getting-started/gatsby/index.html': '/docs/getting-started/#gatsby',
  '/getting-started/next/index.html': '/docs/getting-started/#nextjs',
  '/getting-started/parcel/index.html': '/docs/getting-started/#parcel',
  '/getting-started/react-static/index.html': '/docs/getting-started/#vite',
  '/getting-started/table-of-components/index.html': '/table-of-components/',
  '/getting-started/typescript/index.html': '/docs/getting-started/#types',
  '/getting-started/webpack/index.html': '/docs/getting-started/#webpack',
  '/getting-started/index.html': '/docs/getting-started/',
  '/guides/custom-loader/index.html': '/guides/frontmatter/',
  '/guides/live-code/index.html':
    '/guides/syntax-highlighting/#syntax-highlighting-with-the-meta-field',
  '/guides/markdown-in-components/index.html': '/docs/what-is-mdx/',
  '/guides/math-blocks/index.html': '/guides/math/',
  '/guides/mdx-embed/index.html': '/guides/embed/#embeds-at-run-time',
  '/guides/table-of-contents/index.html': '/docs/extending-mdx/',
  '/guides/terminal/index.html': '/docs/getting-started/#ink',
  '/guides/vue/index.html': '/docs/getting-started/#vue',
  '/guides/wrapper-customization/index.html': '/docs/using-mdx/#layout',
  '/guides/writing-a-plugin/index.html':
    '/docs/extending-mdx/#creating-plugins',
  '/mdx/index.html': '/docs/what-is-mdx/',
  '/plugins/index.html': '/docs/extending-mdx/#using-plugins',
  '/projects/index.html': '/community/projects/',
  '/support/index.html': '/community/support/',
  '/syntax/index.html': '/docs/getting-started/#syntax',
  '/vue/index.html': '/docs/getting-started/#vue'
}
