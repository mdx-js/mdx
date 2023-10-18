// Augment vfile data:
/// <reference types="rehype-infer-description-meta" />

/**
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('react').ReactNode} ReactNode
 * @typedef {import('./sort.js').Item} Item
 */

/**
 * @typedef ItemProps
 *   Props for `NavItem`.
 * @property {boolean | undefined} [includeDescription=false]
 *   Whether to include the description (default: `false`).
 * @property {boolean | undefined} [includePublished=false]
 *   Whether to include the published date (default: `false`).
 * @property {Readonly<Item>} item
 *   Item.
 * @property {string | undefined} [name]
 *   Name.
 *
 * @typedef GroupOnlyProps
 *   Props for `NavGroup`;
 *   Other fields are passed to `NavItem`.
 * @property {string | undefined} [className]
 *   Class name.
 * @property {ReadonlyArray<Item>} items
 *   Items.
 * @property {string | undefined} [sort]
 *   Fields to sort on.
 * @property {string | undefined} [name]
 *   Name.
 *
 * @typedef {Omit<ItemProps, 'item'> & GroupOnlyProps} GroupProps
 *   Props for `NavGroup`.
 */

import {apStyleTitleCase} from 'ap-style-title-case'
import {toJsxRuntime} from 'hast-util-to-jsx-runtime'
import React from 'react'
// @ts-expect-error: the automatic react runtime is untyped.
import {Fragment, jsx, jsxs} from 'react/jsx-runtime'
import {sortItems} from './sort.js'

const runtime = {Fragment, jsx, jsxs}

const dateTimeFormat = new Intl.DateTimeFormat('en', {dateStyle: 'long'})

/**
 * @param {Readonly<GroupProps>} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 */
export function NavGroup(props) {
  const {className, items, sort = 'navSortSelf,meta.title', ...rest} = props

  return (
    <ol {...{className}}>
      {sortItems(items, sort).map(function (d) {
        return <NavItem key={d.name} {...rest} item={d} />
      })}
    </ol>
  )
}

/**
 * @param {Readonly<ItemProps>} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 */
export function NavItem(props) {
  const {includeDescription, includePublished, item, name: activeName} = props
  const {children, data = {}, name} = item
  const {matter = {}, meta = {}, navExcludeGroup, navSortItems} = data
  const title = matter.title || meta.title
  const defaultTitle = apStyleTitleCase(
    name.replace(/\/$/, '').split('/').pop()
  )
  /** @type {ReactNode} */
  let description
  /** @type {string | undefined} */
  let published

  if (includeDescription) {
    if (meta.descriptionHast) {
      // Cast because we don’t expect doctypes.
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
      description = matter.description || meta.description || undefined

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
      {published ? ' — ' + published : undefined}
      {description || undefined}
      {!navExcludeGroup && children.length > 0 ? (
        <NavGroup
          items={children}
          sort={typeof navSortItems === 'string' ? navSortItems : undefined}
          name={activeName}
        />
      ) : undefined}
    </li>
  )
}
