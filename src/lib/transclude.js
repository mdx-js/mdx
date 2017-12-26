import fs from 'fs'
import path from 'path'
import visit from 'unist-util-visit'
import { parse } from 'remark'

import isTranscludable from './is-transcludable'
import isRelativeFile from './is-relative-file'

export default () => (tree, file) =>
  visit(tree, 'text', (node, _i, parent) => {
    if (!isRelativeFile(node.value) || !isTranscludable(node.value)) {
      return
    }

    const index = tree.children.indexOf(parent)

    const transcludedFile = path.join(file.cwd, node.value)
    const content = fs.readFileSync(transcludedFile, 'utf8')

    tree.children = [].concat(
      tree.children.slice(0, index),
      parse(content).children,
      tree.children.slice(index + 1)
    )
  })
