/**
 * @import {Program} from 'estree-jsx'
 * @import {Root} from 'hast'
 * @import {ProcessorOptions} from '../core.js'
 */

import {toEstree} from 'hast-util-to-estree'

/**
 * A plugin to transform an HTML (hast) tree to a JS (estree).
 * `hast-util-to-estree` does all the work for us!
 *
 * @param {Readonly<ProcessorOptions>} options
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
