#!/usr/bin/env node
const init = require('initit')

const example = process.argv[2] || 'next'
const name = process.argv[3] || example + '-mdx'
const template = `mdx-js/mdx/examples/${example}`

init({name, template})
  .then(_res => process.exit(0))
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
