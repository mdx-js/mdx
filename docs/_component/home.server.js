import React from 'react'
import {NavSite, NavSiteSkip} from './nav-site.server.js'
import {FootSite} from './foot-site.server.js'

export const Home = (props) => {
  const {name, navTree, children} = props

  return (
    <div className="page home">
      <NavSiteSkip />
      <main>
        <article>
          <div className="content body">{children}</div>
        </article>
        <FootSite />
      </main>
      <NavSite name={name} navTree={navTree} />
    </div>
  )
}
