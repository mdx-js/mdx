import dlv from 'dlv'

const collator = new Intl.Collator('en').compare

export function sortItems(items, sortString = 'navSortSelf,meta.title') {
  const fields = sortString.split(',').map((d) => {
    const [field, order = 'asc'] = d.split(':')

    if (order !== 'asc' && order !== 'desc') {
      throw new Error('Cannot order as `' + order + '`')
    }

    return [field, order]
  })

  return [...items].sort((left, right) => {
    let index = -1

    while (++index < fields.length) {
      const [field, order] = fields[index]
      let a = dlv(left.data, field)
      let b = dlv(right.data, field)

      if (a && typeof a === 'object' && 'valueOf' in a) a = a.valueOf()
      if (b && typeof b === 'object' && 'valueOf' in b) b = b.valueOf()

      const score =
        typeof a === 'number' || typeof b === 'number'
          ? a === null || a === undefined
            ? 1
            : b === null || b === undefined
            ? -1
            : a - b
          : collator(a, b)
      const result = order === 'asc' ? score : -score
      if (result) return result
    }

    return 0
  })
}
