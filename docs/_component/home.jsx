/**
 * @typedef {import('react').ReactNode} ReactNode
 * @typedef {Exclude<import('vfile').Data['meta'], undefined>} Meta
 * @typedef {import('./sort.js').Item} Item
 */

/**
 * @typedef Props
 * @property {string} name
 * @property {ReactNode} children
 * @property {Item} navTree
 * @property {Meta} meta
 */

import React from 'react'
import {NavSite, NavSiteSkip} from './nav-site.jsx'
import {FootSite} from './foot-site.jsx'

/**
 * @param {Props} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 */
export function Home(props) {
  const {name, meta, navTree, children} = props
  /** @type {unknown} */
  // @ts-expect-error: to do: type.
  const schema = meta.schemaOrg

  return (
    <div className="page home">
      <NavSiteSkip />
      <main>
        {schema ? (
          <script type="application/ld+json">{JSON.stringify(schema)}</script>
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
