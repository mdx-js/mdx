import React from 'react'
import {hydrateRoot} from 'react-dom'
import {createFromFetch} from 'react-server-dom-webpack'
import {Root} from './root.client.js'

window.addEventListener('DOMContentLoaded', main)

if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule(
    'https://www.unpkg.com/css-houdini-squircle@0.2.1/squircle.min.js'
  )
}

async function main() {
  const $root = document.querySelector('#root')
  const nljson = document.querySelector('#payload').dataset.src
  hydrateRoot($root, <Root response={createFromFetch(fetch(nljson))} />)
}
