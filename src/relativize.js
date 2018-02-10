import fs from 'fs'
import path from 'path'
import visit from 'unist-util-visit'
import { parse } from 'remark'

const removeMd = node =>
  node.url = /\.md$/.test(node.url)
    ? node.url.replace(/\.md$/, '/')
    : node.url

export default () => (tree, file) => visit(tree, 'link', removeMd)
