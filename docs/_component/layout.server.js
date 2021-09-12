import React from 'react'
import {NavSite, NavSiteSkip} from './nav-site.server.js'
import {FootArticle} from './foot-article.server.js'
import {FootSite} from './foot-site.server.js'

export function Layout(props) {
  const {name, navTree, children} = props

  return (
    <div className="page doc">
      <NavSiteSkip />
      <main>
        <article>
          <div className="content body">{children}</div>
          <FootArticle {...props} />
        </article>
        <FootSite />
      </main>
      <NavSite name={name} navTree={navTree} />
    </div>
  )
}
