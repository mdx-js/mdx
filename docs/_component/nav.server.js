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
