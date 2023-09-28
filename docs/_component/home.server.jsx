import React from 'react'
import {NavSite, NavSiteSkip} from './nav-site.server.jsx'
import {FootSite} from './foot-site.server.jsx'

export function Home(props) {
  const {name, navTree, children} = props

  return (
    <div className="page home">
      <NavSiteSkip />
      <main>
        {props.meta.schemaOrg && (
          <script type="application/ld+json">
            {JSON.stringify(props.meta.schemaOrg)}
          </script>
        )}
        <article>
          <div className="content body">{children}</div>
        </article>
        <FootSite />
      </main>
      <NavSite name={name} navTree={navTree} />
    </div>
  )
}
