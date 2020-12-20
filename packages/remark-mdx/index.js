'use strict'

let syntaxMdx = require('micromark-extension-mdx')
let syntaxMdxjs = require('micromark-extension-mdxjs')
let fromMarkdown = require('mdast-util-mdx/from-markdown')
let toMarkdown = require('mdast-util-mdx/to-markdown')

let warningIssued

module.exports = mdx

function mdx(options) {
  let settings = options || {}
  let syntax = settings.js === false ? syntaxMdx : syntaxMdxjs
  let data = this.data()

  /* istanbul ignore next - old remark. */
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
    /* istanbul ignore if - other extensions. */
    if (data[field]) data[field].push(value)
    else data[field] = [value]
  }
}
