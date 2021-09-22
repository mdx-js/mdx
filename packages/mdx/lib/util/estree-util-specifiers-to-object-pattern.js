/**
 * @typedef {import('estree-jsx').Identifier} Identifier
 * @typedef {import('estree-jsx').ImportSpecifier} ImportSpecifier
 * @typedef {import('estree-jsx').ImportDefaultSpecifier} ImportDefaultSpecifier
 * @typedef {import('estree-jsx').ImportNamespaceSpecifier} ImportNamespaceSpecifier
 * @typedef {import('estree-jsx').ExportSpecifier} ExportSpecifier
 * @typedef {import('estree-jsx').ObjectPattern} ObjectPattern
 */

import {create} from './estree-util-create.js'

/**
 * @param {Array<ImportSpecifier|ImportDefaultSpecifier|ImportNamespaceSpecifier|ExportSpecifier>} specifiers
 * @returns {ObjectPattern}
 */
export function specifiersToObjectPattern(specifiers) {
  return {
    type: 'ObjectPattern',
    properties: specifiers.map((specifier) => {
      /** @type {Identifier} */
      let key =
        specifier.type === 'ImportSpecifier'
          ? specifier.imported
          : specifier.type === 'ExportSpecifier'
          ? specifier.exported
          : {type: 'Identifier', name: 'default'}
      let value = specifier.local

      // Switch them around if we’re exporting.
      if (specifier.type === 'ExportSpecifier') {
        value = key
        key = specifier.local
      }

      return create(specifier, {
        type: 'Property',
        kind: 'init',
        shorthand: key.name === value.name,
        method: false,
        computed: false,
        key,
        value
      })
    })
  }
}
