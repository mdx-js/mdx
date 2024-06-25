/**
 * @import {ReactNode} from 'react'
 * @import {Data} from 'vfile'
 * @import {Item} from './sort.js'
 */

/**
 * @typedef {Exclude<Data['meta'], undefined>} Meta
 *
 * @typedef Properties
 *   Properties.
 * @property {string} name
 *   Name.
 * @property {ReactNode} children
 *   Children.
 * @property {Item} navigationTree
 *   Navigation tree.
 * @property {Meta} meta
 *   Meta.
 */

import React from 'react'
import {FootSite} from './foot-site.jsx'
import {NavigationSite, NavigationSiteSkip} from './nav-site.jsx'

/**
 * @param {Readonly<Properties>} properties
 *   Properties.
 * @returns {ReactNode}
 *   Element.
 */
export function Home(properties) {
  const {children, meta, name, navigationTree} = properties

  return (
    <div className="page home">
      <NavigationSiteSkip />
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
      <NavigationSite name={name} navigationTree={navigationTree} />
    </div>
  )
}
