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
  output: new URL('./build/', git),
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

export const redirect = {
  '/editor-plugins/index.html': '/editors/',
  '/plugins/index.html': '/advanced/plugins/',
  '/syntax/index.html': '/getting-started/#syntax',
  '/advanced/contributing/index.html': '/contributing/',
  '/advanced/custom-loader/index.html': '/guides/custom-loader/',
  '/advanced/retext-plugins/index.html':
    '/advanced/using-plugins/#using-retext-plugins',
  '/advanced/specification/index.html': '/advanced/ast/',
  '/advanced/sync-api/index.html': '/advanced/api/#sync-api',
  '/advanced/writing-a-plugin/index.html': '/guides/custom-loader/',
  '/getting-started/table-of-components/index.html': '/table-of-components/',
  '/getting-started/typescript/index.html': '/advanced/typescript/'
}
