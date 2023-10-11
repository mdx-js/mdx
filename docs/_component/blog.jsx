import React from 'react'
// @ts-expect-error: untyped.
import {Fragment, jsx, jsxs} from 'react/jsx-runtime'
import {apStyleTitleCase} from 'ap-style-title-case'
import {toJsxRuntime} from 'hast-util-to-jsx-runtime'
import {sortItems} from './sort.js'

const runtime = {Fragment, jsx, jsxs}

const dateTimeFormat = new Intl.DateTimeFormat('en', {dateStyle: 'long'})

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
        {meta.published ? (
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
