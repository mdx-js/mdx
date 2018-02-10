import path from 'path'
import isUrl from 'is-url'
import visit from 'unist-util-visit'
import parseImports from 'parse-es6-imports'

import { isImport } from './util'

export default options => (tree, file) =>
  visit(tree, 'text', (node, i, parent) => {
    if (!isImport(node.value)) {
      return
    }

    const siblings = parent.children
    parent.children = siblings
      .splice(0, i)
      .concat(
        siblings.slice(i + 1, siblings.length)
      )

    file.data.imports = parseImports(node.value)
  })
