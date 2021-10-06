import React from 'react'
import apStyleTitleCase from 'ap-style-title-case'
import {sortItems} from './sort.js'

const dateTimeFormat = new Intl.DateTimeFormat('en')

export const NavGroup = (props) => {
  const {items, className, sort = 'navSortSelf,meta.title', ...rest} = props

  return (
    <ol {...{className}}>
      {sortItems(items, sort).map((d) => (
        <NavItem key={d.name} {...rest} item={d} />
      ))}
    </ol>
  )
}

export const NavItem = (props) => {
  const {item, name: activeName, includeDescription, includePublished} = props
  const {name, children, data = {}} = item
  const {matter = {}, meta = {}, navExcludeGroup, navSortItems} = data
  const title = matter.title || meta.title
  const defaultTitle = apStyleTitleCase(
    name.replace(/\/$/, '').split('/').pop()
  )
  let description
  let published

  if (includeDescription) {
    description = matter.description || meta.description
  }

  if (includePublished && (matter.published || meta.published)) {
    published = dateTimeFormat.format(matter.published || meta.published)
  }

  return (
    <li>
      {title ? (
        <a href={name} aria-current={name === activeName ? 'page' : undefined}>
          {title}
        </a>
      ) : (
        defaultTitle
      )}
      {description ? ' — ' + description : null}
      {published ? ' — ' + published : null}
      {!navExcludeGroup && children.length > 0 ? (
        <NavGroup items={children} sort={navSortItems} name={activeName} />
      ) : null}
    </li>
  )
}
