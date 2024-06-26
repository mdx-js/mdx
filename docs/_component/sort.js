/**
 * @import {Data} from 'vfile'
 */

/**
 * @typedef Item
 *   Item.
 * @property {string} name
 *   Name.
 * @property {Readonly<Data>} data
 *   Data.
 * @property {Array<Item>} children
 *   Children.
 */

import dlv from 'dlv'

const collator = new Intl.Collator('en').compare

/**
 * @param {ReadonlyArray<Item>} items
 *   Items.
 * @param {string | undefined} [sortString]
 *   Fields to sort on (default: `'navSortSelf,meta.title'`).
 * @returns {ReadonlyArray<Item>}
 *   Items.
 */
export function sortItems(items, sortString = 'navSortSelf,meta.title') {
  /** @type {ReadonlyArray<[string, 'asc' | 'desc']>} */
  const fields = sortString.split(',').map(function (d) {
    const [field, order = 'asc'] = d.split(':')

    if (order !== 'asc' && order !== 'desc') {
      throw new Error('Cannot order as `' + order + '`')
    }

    return [field, order]
  })

  return [...items].sort(function (left, right) {
    let index = -1

    while (++index < fields.length) {
      const [field, order] = fields[index]
      /** @type {unknown} */
      let a = dlv(left.data, field)
      /** @type {unknown} */
      let b = dlv(right.data, field)

      // Dates.
      if (a && typeof a === 'object' && 'valueOf' in a) a = a.valueOf()
      if (b && typeof b === 'object' && 'valueOf' in b) b = b.valueOf()

      const score =
        typeof a === 'string' && typeof b === 'string'
          ? collator(a, b)
          : typeof a === 'number' && typeof b === 'number'
            ? a - b
            : (a === null || a === undefined) && (b === null || b === undefined)
              ? 0
              : a === null || a === undefined
                ? 1
                : b === null || b === undefined
                  ? -1
                  : 0

      if (score) return order === 'asc' ? score : -score
    }

    return 0
  })
}
