import React from 'react'
import apStyleTitleCase from 'ap-style-title-case'
import dlv from 'dlv'

const collator = new Intl.Collator('en').compare
const dateTimeFormat = new Intl.DateTimeFormat('en')

export function NavGroup(props) {
  const {items, className, sort = 'navSortSelf,meta.title', ...rest} = props
  const fields = sort.split(',').map(d => {
    const [field, order = 'asc'] = d.split(':')

    if (order !== 'asc' && order !== 'desc') {
      throw new Error('Cannot order as `' + order + '`')
    }

    return [field, order]
  })

  const list = [...items].sort(sortFn)

  return (
    <ol {...{className}}>
      {list.map(d => (
        <NavItem key={d.name} {...rest} item={d} />
      ))}
    </ol>
  )

  function sortFn(left, right) {
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
  }
}

export function NavItem(props) {
  const {item, name: activeName, includeDescription, includePublished} = props
  const {name, children, data = {}} = item
  const {matter = {}, meta = {}, navLabel, navExcludeGroup, navSortItems} = data
  const title = matter.title || meta.title
  const description = matter.description || meta.description
  const published = matter.published || meta.published
  const defaultTitle = apStyleTitleCase(
    name.replace(/\/$/, '').split('/').pop()
  )

  return (
    <li>
      {title ? (
        <a href={name} aria-current={name === activeName ? 'page' : undefined}>
          {title}
        </a>
      ) : (
        defaultTitle
      )}
      {navLabel ? <sup>[{navLabel}]</sup> : null}
      {includeDescription && description ? ' — ' + description : null}
      {includePublished && published
        ? ' — ' + dateTimeFormat.format(published)
        : null}
      {!navExcludeGroup && children.length > 0 ? (
        <NavGroup items={children} sort={navSortItems} name={activeName} />
      ) : null}
    </li>
  )
}
