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
 * @typedef {'css' | 'dom'} StylePropertyNameCase
 *   Casing to use for property names in `style` objects.
 *
 *   CSS casing is for example `background-color` and `-webkit-line-clamp`.
 *   DOM casing is for example `backgroundColor` and `WebkitLineClamp`.
 *
 * @typedef Options
 *   Configuration for internal plugin `rehype-recma`.
 * @property {ElementAttributeNameCase | null | undefined} [elementAttributeNameCase='react']
 *   Specify casing to use for attribute names.
 *
 *   This casing is used for hast elements, not for embedded MDX JSX nodes
 *   (components that someone authored manually).
 * @property {StylePropertyNameCase | null | undefined} [stylePropertyNameCase='dom']
 *   Specify casing to use for property names in `style` objects.
 *
 *   This casing is used for hast elements, not for embedded MDX JSX nodes
 *   (components that someone authored manually).
 */

import {toEstree} from 'hast-util-to-estree'

/**
 * A plugin to transform an HTML (hast) tree to a JS (estree).
 * `hast-util-to-estree` does all the work for us!
 *
 * @type {import('unified').Plugin<[Options | null | undefined] | [], Root, Program>}
 */
export function rehypeRecma(options) {
  return (tree) => toEstree(tree, options)
}
