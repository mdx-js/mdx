import React from 'react'
import {config} from '../_config.js'
import {NavGroup} from './nav.server.js'
import {Mdx} from './icon/mdx.server.js'
import {GitHub} from './icon/github.server.js'
import {Twitter} from './icon/twitter.server.js'
import {OpenCollective} from './icon/open-collective.server.js'

export const NavSiteSkip = () => (
  <a
    href="#start-of-navigation"
    id="start-of-content"
    className="skip-to-navigation"
  >
    Skip to navigation
  </a>
)

export const NavSite = (props) => {
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
        <a href="/" rel="home" aria-current={name === '/' ? 'page' : undefined}>
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
