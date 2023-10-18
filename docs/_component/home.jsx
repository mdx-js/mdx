/**
 * @typedef {import('react').ReactNode} ReactNode
 * @typedef {import('vfile').Data['meta']} DataMeta
 * @typedef {import('./sort.js').Item} Item
 */

/**
 * @typedef {Exclude<DataMeta, undefined>} Meta
 *
 * @typedef Props
 *   Props.
 * @property {string} name
 *   Name.
 * @property {ReactNode} children
 *   Children.
 * @property {Item} navTree
 *   Navigation tree.
 * @property {Meta} meta
 *   Meta.
 */

import React from 'react'
import {FootSite} from './foot-site.jsx'
import {NavSite, NavSiteSkip} from './nav-site.jsx'

/**
 * @param {Readonly<Props>} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 */
export function Home(props) {
  const {children, meta, name, navTree} = props

  return (
    <div className="page home">
      <NavSiteSkip />
      <main>
        {meta.schemaOrg ? (
          <script type="application/ld+json">
            {JSON.stringify(meta.schemaOrg)}
          </script>
        ) : undefined}
        <article>
          <div className="content body">{children}</div>
        </article>
        <FootSite />
      </main>
      <NavSite name={name} navTree={navTree} />
    </div>
  )
}
