/**
 * @typedef {import('./sort.js').Item} Item
 */

/**
 * @typedef Props
 *   Props.
 * @property {string} name
 *   Name.
 * @property {Readonly<Item>} navTree
 *   Navigation tree.
 */

import React from 'react'
import {config} from '../_config.js'
import {GitHub} from './icon/github.jsx'
import {Mdx} from './icon/mdx.jsx'
import {OpenCollective} from './icon/open-collective.jsx'
import {Twitter} from './icon/twitter.jsx'
import {NavGroup} from './nav.jsx'

export function NavSiteSkip() {
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
 * @param {Readonly<Props>} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 */
export function NavSite(props) {
  const {name, navTree} = props

  return (
    <nav className="navigation" aria-label="Site navigation">
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
      <NavGroup
        className="navigation-secondary"
        items={navTree.children}
        name={name}
      />
      <ol className="navigation-tertiary">
        <li>
          <a href={config.gh.href}>
            <GitHub />
          </a>
        </li>
        <li className="navigation-show-big">
          <a href={config.twitter.href}>
            <Twitter />
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
