// Augment vfile data:
/// <reference types="rehype-infer-description-meta" />

/**
 * @import {ElementContent} from 'hast'
 * @import {ReactNode} from 'react'
 * @import {Item} from './sort.js'
 */

/**
 * @typedef ItemProperties
 *   Properties for `NavigationItem`.
 * @property {boolean | undefined} [includeDescription=false]
 *   Whether to include the description (default: `false`).
 * @property {boolean | undefined} [includePublished=false]
 *   Whether to include the published date (default: `false`).
 * @property {Readonly<Item>} item
 *   Item.
 * @property {string | undefined} [name]
 *   Name.
 *
 * @typedef GroupOnlyProperties
 *   Properties for `NavigationGroup`;
 *   Other fields are passed to `NavigationItem`.
 * @property {string | undefined} [className]
 *   Class name.
 * @property {ReadonlyArray<Item>} items
 *   Items.
 * @property {string | undefined} [sort]
 *   Fields to sort on.
 * @property {string | undefined} [name]
 *   Name.
 *
 * @typedef {Omit<ItemProperties, 'item'> & GroupOnlyProperties} GroupProperties
 *   Properties for `NavigationGroup`.
 */

import {apStyleTitleCase} from 'ap-style-title-case'
import {toJsxRuntime} from 'hast-util-to-jsx-runtime'
import React from 'react'
import {Fragment, jsx, jsxs} from 'react/jsx-runtime'
import {sortItems} from './sort.js'

const dateTimeFormat = new Intl.DateTimeFormat('en', {dateStyle: 'long'})

/**
 * @param {Readonly<GroupProperties>} properties
 *   Properties.
 * @returns {ReactNode}
 *   Element.
 */
export function NavigationGroup(properties) {
  const {
    className,
    items,
    sort = 'navSortSelf,meta.title',
    ...rest
  } = properties

  return (
    <ol {...{className}}>
      {sortItems(items, sort).map(function (d) {
        return <NavigationItem key={d.name} {...rest} item={d} />
      })}
    </ol>
  )
}

/**
 * @param {Readonly<ItemProperties>} properties
 *   Properties.
 * @returns {ReactNode}
 *   Element.
 */
export function NavigationItem(properties) {
  const {
    includeDescription,
    includePublished,
    item,
    name: activeName
  } = properties
  const {children, data = {}, name} = item
  const {matter = {}, meta = {}, navExcludeGroup, navigationSortItems} = data
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
        {Fragment, jsx, jsxs}
      )
    } else {
      description = matter.description || meta.description || undefined

      description &&= (
        <div className="nav-description">
          <p>{description}</p>
        </div>
      )
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
        <NavigationGroup
          items={children}
          sort={
            typeof navigationSortItems === 'string'
              ? navigationSortItems
              : undefined
          }
          name={activeName}
        />
      ) : undefined}
    </li>
  )
}
