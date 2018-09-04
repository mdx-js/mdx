#!/usr/bin/env node
const init = require('initit')

const [example = 'next', name = 'next-mdx'] = process.argv.slice(2, 3)
const template = `mdx-js/mdx/examples/${example}`

init({ name, template })
  .then(res => process.exit(0))
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
