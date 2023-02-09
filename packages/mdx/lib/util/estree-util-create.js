/**
 * @typedef {import('estree-jsx').Node} Node
 */

/**
 * @param {Node} from
 *   Node to take from.
 * @param {Node} to
 *   Node to add to.
 * @returns {void}
 *   Nothing.
 */
export function create(from, to) {
  /** @type {Array<keyof Node>} */
  // @ts-expect-error: `start`, `end`, `comments` are custom Acorn fields.
  const fields = ['start', 'end', 'loc', 'range', 'comments']
  let index = -1

  while (++index < fields.length) {
    const field = fields[index]

    if (field in from) {
      // @ts-expect-error: assume they’re settable.
      to[field] = from[field]
    }
  }
}
