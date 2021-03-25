/**
 * Patch `gatsby-theme-mdx1` which resolves `@mdx-js/mdx@1` for now,
 * it results incorrect pkg.version in header, and warning about importing `@reach/skip-nav/styles.css`.
 */
const fs = require('fs')

const headerFilename = 'node_modules/gatsby-theme-mdx1/src/components/header.js'

const mdxPkgImport = "import pkg from '@mdx-js/mdx/package.json'"

const headerContent = fs.readFileSync(headerFilename, 'utf8')

if (headerContent.includes(mdxPkgImport)) {
  fs.writeFileSync(
    headerFilename,
    headerContent.replace(
      mdxPkgImport,
      "import pkg from '../../../../packages/mdx/package.json'"
    )
  )
}

const skipNavFilename =
  'node_modules/gatsby-theme-mdx1/src/components/skip-nav.js'

const skipNavStyles = "import '@reach/skip-nav/styles.css'"

const skipNavContent = fs.readFileSync(skipNavFilename, 'utf8')

if (!skipNavContent.startsWith(skipNavStyles)) {
  fs.writeFileSync(skipNavFilename, skipNavStyles + '\n' + skipNavContent)
}
