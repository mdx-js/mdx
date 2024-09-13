/* eslint-disable unicorn/prefer-query-selector */
/// <reference lib="dom" />

import docsearch_ from '@docsearch/js'
import {computePosition, shift} from '@floating-ui/dom'
import copyToClipboard from 'copy-to-clipboard'
import {ok as assert} from 'devlop'

// Squircles.
if ('paintWorklet' in CSS) {
  // @ts-expect-error: TS doesn’t understand Houdini.
  CSS.paintWorklet.addModule(
    'https://www.unpkg.com/css-houdini-squircle@0.2.1/squircle.min.js'
  )
}

// Copy buttons.
const copies = Array.from(document.querySelectorAll('button.copy-button'))
const copyTemplate = document.createElement('template')
const copiedTemplate = document.createElement('template')
copyTemplate.innerHTML = `<svg
  role="img"
  aria-label="Copy"
  class="icon icon-copy"
  viewBox="0 0 16 16"
  width=16
  height=16
>
  <title>Copy</title>
  <path
    fill="currentcolor"
    fill-rule="evenodd"
    d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"
  />
  <path
    fill="currentcolor"
    fill-rule="evenodd"
    d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"
  />
</svg>`
copiedTemplate.innerHTML = `<svg
  role="img"
  aria-label="Copied!"
  class="icon icon-copy"
  viewBox="0 0 16 16"
  width=16
  height=16
>
  <title>Copied!</title>
  <path
    fill="currentcolor"
    fill-rule="evenodd"
    d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
  />
</svg>`
const copyIcon = copyTemplate.content.querySelector('svg')
const copiedIcon = copiedTemplate.content.querySelector('svg')
assert(copyIcon)
assert(copiedIcon)

for (const copy of copies) {
  assert(copy instanceof HTMLButtonElement)
  copy.type = 'button'
  copy.replaceChildren(copyIcon.cloneNode(true))
  copy.addEventListener('click', oncopyonclick)
}

const popoverTargets = /** @type {Array<HTMLElement>} */ (
  Array.from(document.querySelectorAll('.rehype-twoslash-popover-target'))
)

for (const popoverTarget of popoverTargets) {
  /** @type {NodeJS.Timeout | number} */
  let timeout = 0

  popoverTarget.addEventListener('click', function () {
    popoverShow(popoverTarget)
  })

  popoverTarget.addEventListener('mouseenter', function () {
    clearTimeout(timeout)
    timeout = setTimeout(function () {
      popoverShow(popoverTarget)
    }, 300)
  })

  popoverTarget.addEventListener('mouseleave', function () {
    clearTimeout(timeout)
  })

  if (popoverTarget.classList.contains('rehype-twoslash-autoshow')) {
    popoverShow(popoverTarget)
  }
}

/**
 * @this {HTMLButtonElement}
 *   Button element.
 * @returns {undefined}
 *   Nothing.
 */
function oncopyonclick() {
  assert(copyIcon)
  assert(copiedIcon)
  assert(this instanceof HTMLButtonElement)

  const value = this.dataset.value
  assert(value !== undefined)

  this.classList.add('success')
  this.replaceChildren(copiedIcon.cloneNode(true))

  copyToClipboard(value)

  setTimeout(() => {
    this.classList.remove('success')
    this.replaceChildren(copyIcon.cloneNode(true))
  }, 2000)
}

/**
 * @param {HTMLElement} popoverTarget
 *   Popover target.
 * @returns {undefined}
 *   Nothing.
 */
function popoverShow(popoverTarget) {
  const id = popoverTarget.dataset.popoverTarget
  if (!id) return
  const popover = document.getElementById(id)
  if (!popover) return

  popover.showPopover()

  computePosition(popoverTarget, popover, {
    placement: 'bottom',
    middleware: [shift({padding: 5})]
  }).then(
    /**
     * @param {{x: number, y: number}} value
     */
    function (value) {
      popover.style.left = value.x + 'px'
      popover.style.top = value.y + 'px'
    }
  )
}

// Docsearch.
// Note: types are wrong.
const docsearch = /** @type {import('@docsearch/js')['default']} */ (
  /** @type {unknown} */ (docsearch_)
)

docsearch({
  appId: 'B0O9AAZ9L2',
  apiKey: '71f38eae605e3e6d500368617e32c19f',
  container: '#docsearch',
  indexName: 'mdxjs'
})
