/**
 * Utility to turn a list of extnames (*with* dots) into an expression.
 *
 * @param {string[]} extnames List of extnames
 * @returns {RegExp} Regex matching them
 */
export function extnamesToRegex(extnames) {
  return new RegExp(
    '\\.(' + extnames.map(d => d.slice(1)).join('|') + ')([?#]|$)'
  )
}
