// To do: note that `VERCEL_*` env variables aren’t available, for some reason,
// I’m suspecting that’s because `vercel.json` is used rather than settings
// in the dashboard.

import process from 'process'
import {execSync as exec} from 'child_process'

let branch =
  process.env.VERCEL_GIT_COMMIT_REF ||
  String(exec('git rev-parse --abbrev-ref HEAD')).trim()

// To do: `vercel` currently says `master` is used.
if (branch === 'HEAD' || branch === 'master') branch = 'main'

const site = new URL(process.env.VERCEL_URL || 'https://mdxjs.com')

const git = new URL('../', import.meta.url)
const gh = new URL('https://github.com/mdx-js/mdx/')

export const config = {
  input: new URL('./docs/', git),
  output: new URL('./public/', git),
  git,
  gh,
  ghBlob: new URL('./blob/' + branch + '/', gh),
  ghTree: new URL('./tree/' + branch + '/', gh),
  site,
  twitter: new URL('https://twitter.com/mdx_js'),
  oc: new URL('https://opencollective.com/unified'),
  color: '#fcb32c',
  title: 'MDX',
  tags: ['mdx', 'markdown', 'jsx', 'oss', 'react'],
  author: 'MDX contributors'
}

// To do: check if all the hashes still work.
export const redirect = {
  '/advanced/api/index.html': '/packages/mdx/#api',
  '/advanced/ast/index.html': '/packages/remark-mdx/#syntax-tree',
  '/advanced/components/index.html': '/using-mdx/',
  '/advanced/contributing/index.html': '/contributing/',
  '/advanced/custom-loader/index.html': '/guides/custom-loader/',
  '/advanced/retext-plugins/index.html':
    '/advanced/using-plugins/#using-retext-plugins',
  '/advanced/runtime/index.html': '/packages/mdx/#evaluatefile-options',
  '/advanced/specification/index.html': '/advanced/ast/',
  '/advanced/sync-api/index.html': '/advanced/api/#sync-api',
  '/advanced/transform-content/index.html': '/packages/remark-mdx/',
  '/advanced/typescript/index.html': '/getting-started/#types',
  '/advanced/writing-a-plugin/index.html': '/guides/custom-loader/',
  '/editor-plugins/index.html': '/editors/',
  '/getting-started/create-react-app/index.html':
    '/getting-started/#create-react-app-cra',
  '/getting-started/gatsby/index.html': '/getting-started/#gatsby',
  '/getting-started/next/index.html': '/getting-started/#nextjs',
  '/getting-started/parcel/index.html': '/getting-started/#parcel',
  '/getting-started/react-static/index.html': '/getting-started/#react-static',
  '/getting-started/table-of-components/index.html': '/table-of-components/',
  '/getting-started/typescript/index.html': '/advanced/typescript/',
  '/getting-started/webpack/index.html': '/getting-started/#webpack',
  '/guides/custom-loader/index.html': '/guides/frontmatter/',
  '/guides/live-code/index.html':
    '/guides/syntax-highlighting/#syntax-highlighting-with-the-meta-field',
  '/guides/markdown-in-components/index.html':
    '/mdx/#markdown-for-the-component-era',
  '/guides/math-blocks/index.html': '/guides/math/',
  '/guides/mdx-embed/index.html': '/guides/embed/#embeds-at-run-time',
  '/guides/table-of-contents/index.html':
    'https://github.com/remarkjs/remark-toc',
  '/guides/terminal/index.html': '/getting-started/#ink',
  '/guides/vue/index.html': '/getting-started/#vue',
  '/guides/wrapper-customization/index.html': '/using-mdx/#layout',
  '/plugins/index.html': '/advanced/plugins/',
  '/syntax/index.html': '/getting-started/#syntax'
}
