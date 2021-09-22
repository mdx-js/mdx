/**
 * @typedef {import('estree-jsx').Node} Node
 */

/**
 * @template {Node} N
 * @param {Node} template
 * @param {N} node
 * @returns {N}
 */
export function create(template, node) {
  /** @type {Array<keyof template>} */
  // @ts-expect-error: `start`, `end`, `comments` are custom Acorn fields.
  const fields = ['start', 'end', 'loc', 'range', 'comments']
  let index = -1

  while (++index < fields.length) {
    const field = fields[index]

    if (field in template) {
      // @ts-expect-error: assume they’re settable.
      node[field] = template[field]
    }
  }

  return node
}
