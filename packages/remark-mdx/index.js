'use strict'

const syntaxMdx = require('micromark-extension-mdx')
const syntaxMdxjs = require('micromark-extension-mdxjs')
const fromMarkdown = require('mdast-util-mdx/from-markdown')
const toMarkdown = require('mdast-util-mdx/to-markdown')

let warningIssued

module.exports = mdx

function mdx(options) {
  const settings = options || {}
  const syntax = settings.js === false ? syntaxMdx : syntaxMdxjs
  const data = this.data()

  // Old remark.
  /* c8 ignore next 14 */
  if (
    !warningIssued &&
    ((this.Parser &&
      this.Parser.prototype &&
      this.Parser.prototype.blockTokenizers) ||
      (this.Compiler &&
        this.Compiler.prototype &&
        this.Compiler.prototype.visitors))
  ) {
    warningIssued = true
    console.warn(
      '[remark-mdx] Warning: please upgrade to remark 13 to use this plugin'
    )
  }

  add('micromarkExtensions', syntax(options))
  add('fromMarkdownExtensions', fromMarkdown)
  add('toMarkdownExtensions', toMarkdown)

  function add(field, value) {
    // Other extensions.
    /* c8 ignore next */
    if (data[field]) data[field].push(value)
    else data[field] = [value]
  }
}
