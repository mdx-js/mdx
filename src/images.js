import path from 'path'
import isUrl from 'is-url'
import visit from 'unist-util-visit'
import { parse } from 'remark'

import {
  isTranscludableImg,
  isRelativeFile
} from './util'

export default () => (tree, file) =>
  visit(tree, 'text', (node, _i, parent) => {
    if (!isTranscludableImg(node.value)) {
      return
    }

    if (!isRelativeFile(node.value) && !isUrl(node.value)) {
      return
    }

    node.type = 'image'
    node.url = node.value
    delete node.value
  })
