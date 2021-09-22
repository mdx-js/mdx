/**
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {import('hast').Root} Root
 */

import {toEstree} from 'hast-util-to-estree'

/**
 * A plugin to transform an HTML (hast) tree to a JS (estree).
 * `hast-util-to-estree` does all the work for us!
 *
 * @type {import('unified').Plugin<void[], Root, Program>}
 */
export function rehypeRecma() {
  return (tree) => toEstree(tree)
}
