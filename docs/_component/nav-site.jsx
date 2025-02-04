/**
 * @import {ReactNode} from 'react'
 * @import {Item} from './sort.js'
 */

/**
 * @typedef Properties
 *   Properties.
 * @property {string} name
 *   Name.
 * @property {Readonly<Item>} navigationTree
 *   Navigation tree.
 */

import React from 'react'
import {config} from '../_config.js'
import {GitHub} from './icon/github.jsx'
import {Mdx} from './icon/mdx.jsx'
import {OpenCollective} from './icon/open-collective.jsx'
import {NavigationGroup} from './nav.jsx'

export function NavigationSiteSkip() {
  return (
    <a
      href="#start-of-navigation"
      id="start-of-content"
      className="skip-to-navigation"
    >
      Skip to navigation
    </a>
  )
}

/**
 * @param {Readonly<Properties>} properties
 *   Properties.
 * @returns {ReactNode}
 *   Element.
 */
export function NavigationSite(properties) {
  const {name, navigationTree} = properties

  return (
    <nav className="navigation" aria-label="Site navigation">
      <div id="banner">Ceasefire now! 🕊️</div>
      <a
        href="#start-of-content"
        id="start-of-navigation"
        className="skip-to-content"
      >
        Skip to content
      </a>
      <div className="navigation-primary">
        <a href="/" aria-current={name === '/' ? 'page' : undefined}>
          <h1>
            <Mdx />
          </h1>
        </a>
      </div>
      <div className="navigation-search">
        <div id="docsearch" />
      </div>
      <NavigationGroup
        className="navigation-secondary"
        items={navigationTree.children}
        name={name}
      />
      <ol className="navigation-tertiary">
        <li>
          <a href={config.gh.href}>
            <GitHub />
          </a>
        </li>
        <li className="navigation-show-big">
          <a href={config.oc.href}>
            <OpenCollective />
          </a>
        </li>
      </ol>
    </nav>
  )
}
