// Augment vfile data:
/// <reference types="rehype-infer-description-meta" />

/**
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('./sort.js').Item} Item
 */

/**
 * @typedef ItemProps
 * @property {boolean | undefined} [includeDescription]
 * @property {boolean | undefined} [includePublished]
 * @property {Item} item
 * @property {string | undefined} [name]
 *
 * @typedef GroupProps
 * @property {string | undefined} [className]
 * @property {Array<Item>} items
 * @property {string | undefined} [sort]
 * @property {string | undefined} [name]
 */

import React from 'react'
// @ts-expect-error: untyped.
import {Fragment, jsx, jsxs} from 'react/jsx-runtime'
import {apStyleTitleCase} from 'ap-style-title-case'
import {toJsxRuntime} from 'hast-util-to-jsx-runtime'
import {sortItems} from './sort.js'

const runtime = {Fragment, jsx, jsxs}

const dateTimeFormat = new Intl.DateTimeFormat('en', {dateStyle: 'long'})

/**
 * @param {GroupProps} props
 * @returns {JSX.Element}
 */
export function NavGroup(props) {
  const {items, className, sort = 'navSortSelf,meta.title', ...rest} = props

  return (
    <ol {...{className}}>
      {sortItems(items, sort).map((d) => (
        <NavItem key={d.name} {...rest} item={d} />
      ))}
    </ol>
  )
}

/**
 * @param {ItemProps} props
 * @returns {JSX.Element}
 */
export function NavItem(props) {
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
    if (meta.descriptionHast) {
      const children = /** @type {Array<ElementContent>} */ (
        meta.descriptionHast.children
      )

      description = toJsxRuntime(
        {
          type: 'element',
          tagName: 'div',
          properties: {className: ['nav-description']},
          children
        },
        runtime
      )
    } else {
      description = matter.description || meta.description || null

      if (description) {
        description = (
          <div className="nav-description">
            <p>{description}</p>
          </div>
        )
      }
    }
  }

  const pub = matter.published || meta.published

  if (includePublished && pub) {
    published = dateTimeFormat.format(
      typeof pub === 'string' ? new Date(pub) : pub || undefined
    )
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
      {published ? ' — ' + published : null}
      {description || null}
      {!navExcludeGroup && children.length > 0 ? (
        <NavGroup
          items={children}
          sort={typeof navSortItems === 'string' ? navSortItems : undefined}
          name={activeName}
        />
      ) : null}
    </li>
  )
}
