import React from 'react'
import {NavSite, NavSiteSkip} from './nav-site.server.js'
import {FootSite} from './foot-site.server.js'
import {sortItems} from './sort.js'

const dateTimeFormat = new Intl.DateTimeFormat('en', {dateStyle: 'long'})

export const Layout = (props) => {
  const {name, navTree, ghUrl} = props
  const [self, parent] = findSelfAndParent(navTree) || []
  const siblings = parent
    ? sortItems(parent.children, parent.data.navSortItems)
    : []
  const meta = (self ? self.data.meta : props.meta) || {}
  const index = siblings.indexOf(self)
  const previous = index === -1 ? undefined : siblings[index - 1]
  const next = index === -1 ? undefined : siblings[index + 1]
  const metaAuthors = meta.authors || []
  const metaTime = (
    self
      ? accumulateReadingTime(self)
      : meta.readingTime
      ? Array.isArray(meta.readingTime)
        ? meta.readingTime
        : [meta.readingTime, meta.readingTime]
      : []
  ).map((d) => (d > 15 ? Math.round(d / 5) * 5 : Math.ceil(d)))
  let timeLabel

  if (metaTime.length > 1 && metaTime[0] !== metaTime[1]) {
    timeLabel = metaTime[0] + '-' + metaTime[1] + ' minutes'
  } else if (metaTime[0]) {
    timeLabel = metaTime[0] + ' minute' + (metaTime[0] > 1 ? 's' : '')
  }

  function accumulateReadingTime(d) {
    const time = (d.data.meta || {}).readingTime
    const total = time ? (Array.isArray(time) ? time : [time, time]) : []

    let index = -1
    while (++index < d.children.length) {
      const childTime = accumulateReadingTime(d.children[index])
      if (childTime[0]) total[0] = (total[0] || 0) + childTime[0]
      if (childTime[1]) total[1] = (total[1] || 0) + childTime[1]
    }

    return total
  }

  function entryToTitle(d) {
    return (d.data.matter || {}).title || (d.data.meta || {}).title
  }

  const up =
    parent && self && parent !== navTree ? (
      <div>
        <a href={parent.name}>{entryToTitle(parent)}</a>
        {' / '}
        <a href={name} aria-current="page">
          {entryToTitle(self)}
        </a>
      </div>
    ) : undefined

  const back = previous ? (
    <div>
      Previous:
      <br />
      <a rel="prev" href={previous.name}>
        {entryToTitle(previous)}
      </a>
    </div>
  ) : undefined

  const forward = next ? (
    <div>
      Next:
      <br />
      <a rel="next" href={next.name}>
        {entryToTitle(next)}
      </a>
    </div>
  ) : undefined

  const edit = (
    <div>
      Found a typo? Other suggestions?
      <br />
      <a href={ghUrl.href}>Edit this page on GitHub</a>
    </div>
  )

  const published = meta.published ? (
    <>
      Published on{' '}
      <time dateTime={meta.published.toISOString()}>
        {dateTimeFormat.format(meta.published)}
      </time>
    </>
  ) : undefined

  const modified = meta.modified ? (
    <>
      Modified on{' '}
      <time dateTime={meta.published.toISOString()}>
        {dateTimeFormat.format(meta.modified)}
      </time>
    </>
  ) : undefined

  const date =
    published || modified ? (
      <div>
        {published}
        {published && modified ? <br /> : undefined}
        {modified}
      </div>
    ) : undefined

  const readingTime = timeLabel ? <>{timeLabel} read</> : undefined

  const creditsList = metaAuthors.map((d, i) => {
    const href = d.github
      ? 'https://github.com/' + d.github
      : d.twitter
      ? 'https://twitter.com/' + d.twitter
      : d.url
      ? d.url
      : undefined
    return (
      <span key={d.name}>
        {i ? ', ' : ''}
        {href ? <a href={href}>{d.name}</a> : d.name}
      </span>
    )
  })

  const credits = creditsList.length > 0 ? <>By {creditsList}</> : undefined

  const info =
    readingTime || credits ? (
      <>
        {readingTime}
        {readingTime && credits ? <br /> : undefined}
        {credits}
      </>
    ) : undefined

  const header =
    up || info ? (
      <div className="block article-row">
        {up ? <div className="article-row-start">{up}</div> : undefined}
        {info ? <div className="article-row-end">{info}</div> : undefined}
      </div>
    ) : undefined

  const tail =
    edit || date ? (
      <div className="block article-row">
        {edit ? <div className="article-row-start">{edit}</div> : undefined}
        {date ? <div className="article-row-end">{date}</div> : undefined}
      </div>
    ) : undefined

  const footer =
    back || forward ? (
      <div className="block article-row">
        {back ? <div className="article-row-start">{back}</div> : undefined}
        {forward ? <div className="article-row-end">{forward}</div> : undefined}
      </div>
    ) : undefined

  return (
    <div className="page doc">
      <NavSiteSkip />
      <main>
        <article>
          {header ? (
            <header className="content">
              <div className="block head-article">{header}</div>
            </header>
          ) : undefined}
          <div className="content body">{props.children}</div>
          {footer || tail ? (
            <footer className="content">
              <div className="block foot-article">
                {footer}
                {tail}
              </div>
            </footer>
          ) : undefined}
        </article>
        <FootSite />
      </main>
      <NavSite name={name} navTree={navTree} />
    </div>
  )

  function findSelfAndParent(item, parent) {
    if (item.name === name) return [item, parent]

    let index = -1

    while (++index < item.children.length) {
      const result = findSelfAndParent(item.children[index], item)

      if (result) return result
    }
  }
}
