import {createRequire} from 'module'

export default function (bundler) {
  bundler.addAssetType(
    'mdx',
    createRequire(import.meta.url).resolve('./MDXAsset.js')
  )
}
