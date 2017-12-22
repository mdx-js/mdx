'use strict'

const unified = require('unified')
const parse = require('remark-parse')
const toHAST = require('mdast-util-to-hast')

module.exports = (md, options = {}) => {
  const tree = unified()
    .use(parse)
    .parse(md)

  const hast = toHAST(tree)

  return hast
}
