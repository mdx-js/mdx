/**
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {import('hast').Root} Root
 */

/**
 * @typedef {'html' | 'react'} ElementAttributeNameCase
 *   Specify casing to use for attribute names.
 *
 *   HTML casing is for example `class`, `stroke-linecap`, `xml:lang`.
 *   React casing is for example `className`, `strokeLinecap`, `xmlLang`.
 *
 * @typedef Options
 *   Configuration for internal plugin `rehype-recma`.
 * @property {ElementAttributeNameCase | null | undefined} [elementAttributeNameCase='react']
 *   Specify casing to use for attribute names (default: `'react'`).
 *
 *   This casing is used for hast elements, not for embedded MDX JSX nodes
 *   (components that someone authored manually).
 * @property {StylePropertyNameCase | null | undefined} [stylePropertyNameCase='dom']
 *   Specify casing to use for property names in `style` objects (default: `'dom'`).
 *
 *   This casing is used for hast elements, not for embedded MDX JSX nodes
 *   (components that someone authored manually).
 * @property {boolean | null | undefined} [tableCellAlignToStyle=true]
 *   Turn obsolete `align` props on `td` and `th` into CSS `style` props
 *   (default: `true`).
 *
 * @typedef {'css' | 'dom'} StylePropertyNameCase
 *   Casing to use for property names in `style` objects.
 *
 *   CSS casing is for example `background-color` and `-webkit-line-clamp`.
 *   DOM casing is for example `backgroundColor` and `WebkitLineClamp`.
 */

import {toEstree} from 'hast-util-to-estree'

/**
 * A plugin to transform an HTML (hast) tree to a JS (estree).
 * `hast-util-to-estree` does all the work for us!
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export function rehypeRecma(options) {
  /**
   * @param {Root} tree
   *   Tree (hast).
   * @returns {Program}
   *   Program (esast).
   */
  return function (tree) {
    return toEstree(tree, options)
  }
}
