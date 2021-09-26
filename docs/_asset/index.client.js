import React from 'react'
import {hydrateRoot} from 'react-dom'
import {createFromFetch} from 'react-server-dom-webpack'
import {Root} from './root.client.js'

window.addEventListener('DOMContentLoaded', main)

async function main() {
  const $root = document.querySelector('#root')
  const nljson = document.querySelector('#payload').dataset.src
  hydrateRoot($root, <Root response={createFromFetch(fetch(nljson))} />)
}
