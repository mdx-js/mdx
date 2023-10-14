/**
 * @typedef {import('./sort.js').Item} Item
 */

/**
 * @typedef EntryProps
 * @property {Item} item
 *
 * @typedef GroupProps
 * @property {string | undefined} [className]
 * @property {Array<Item>} items
 * @property {string | undefined} [sort]
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
 * @param {EntryProps} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 */
export function BlogEntry(props) {
  const {item} = props
  const {name, data = {}} = item
  const {matter = {}, meta = {}} = data
  const title = matter.title || meta.title
  const defaultTitle = apStyleTitleCase(
    name.replace(/\/$/, '').split('/').pop()
  )
  const description = matter.description || meta.description
  const time = (
    meta.readingTime
      ? Array.isArray(meta.readingTime)
        ? meta.readingTime
        : [meta.readingTime, meta.readingTime]
      : []
  ).map((d) => Math.ceil(d))
  let timeLabel

  if (time.length > 1 && time[0] !== time[1]) {
    timeLabel = time[0] + '-' + time[1] + ' minutes'
  } else if (time[0]) {
    timeLabel = time[0] + ' minute' + (time[0] > 1 ? 's' : '')
  }

  return (
    <div className="card">
      <h3>
        <a href={name}>{title || defaultTitle}</a>
      </h3>
      <div>
        {meta.descriptionHast ? (
          toJsxRuntime(meta.descriptionHast, runtime)
        ) : description ? (
          <p>{description}</p>
        ) : null}
        <span>
          <a href={name}>Continue reading »</a>
        </span>
      </div>
      <div
        style={{display: 'flex', justifyContent: 'space-between'}}
        className="block"
      >
        <div>
          {meta.author ? (
            <>
              <small>By {meta.author}</small>
              <br />
            </>
          ) : undefined}
          <small>Reading time: {timeLabel}</small>
        </div>
        {meta.published && typeof meta.published === 'object' ? (
          <div style={{marginLeft: 'auto', textAlign: 'right'}}>
            <small>
              Published on{' '}
              <time dateTime={meta.published.toISOString()}>
                {dateTimeFormat.format(meta.published)}
              </time>
            </small>
          </div>
        ) : undefined}
      </div>
    </div>
  )
}

/**
 * @param {GroupProps} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 */
export function BlogGroup(props) {
  const {items, className, sort = 'navSortSelf,meta.title', ...rest} = props
  const sorted = sortItems(items, sort)

  return (
    <>
      {sorted.map((d) => (
        <BlogEntry key={d.name} {...rest} item={d} />
      ))}
    </>
  )
}
