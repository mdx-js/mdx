const unified = require('unified')
const remarkParse = require('remark-parse')
const remarkStringify = require('remark-stringify')
const remarkMDX = require('..')

const fixtures = require('./fixtures')

function jsxCompiler() {
  this.Compiler.prototype.visitors.jsx = node => node.value
}

const parse = mdx => {
  const result = unified()
    .use(remarkParse)
    .use(remarkMDX)
    .use(remarkStringify)
    .use(jsxCompiler)
    .processSync(mdx)

  return result.contents
}

fixtures.forEach(fixture => {
  it(fixture.description, () => {
    const result = parse(fixture.mdx)

    expect(result.trim()).toEqual(fixture.mdx)
  })
})
