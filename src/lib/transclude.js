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

    if (index === -1) {
      return
    }

    const transcludedFile = path.join(file.cwd, node.value)

    let content = null
    try {
      content = fs.readFileSync(transcludedFile, 'utf8')
    } catch (e) {
      console.log(`Error transcluding ${transcludedFile}`)
    }

    if (content) {
      tree.children = [].concat(
        tree.children.slice(0, index),
        parse(content).children,
        tree.children.slice(index + 1)
      )
    }
  })
