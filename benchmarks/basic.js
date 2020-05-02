const fs = require('fs')
const mdx = require('@mdx-js/mdx')

const fixture = fs.readFileSync('fixtures/basic.mdx', 'utf8')

module.exports = () => {
  mdx.sync(fixture)
}
