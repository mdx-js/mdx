import React from 'react'
import RebassMDX from '@rebass/mdx'
import createScope from '@rebass/markdown'
import * as Rebass from 'rebass'
import sortBy from 'lodash.sortby'
import {SidebarLayout, ScopeProvider} from '@compositor/x0/components'
import {LiveEditor, Logo} from './_ui'

import pkg from '../packages/mdx/package.json'

const scope = {
  ...createScope(),
  ...Rebass,
  code: LiveEditor,
  pre: ({children}) => children
}

/* eslint-disable prettier/prettier */
const navOrder = [
  'index',
  'getting-started',
    'next',
    'gatsby',
    'create-react-app',
    'react-static',
    'webpack',
    'parcel',
    'x0',
  'guides',
    'syntax-highlighting',
    'live-code',
    'table-of-contents',
    'writing-a-plugin',
    'custom-loader',
    'wrapper-customization',
  'advanced',
    'plugins',
    'api',
    'ast',
    'components',
    'retext-plugins',
    'specification',
    'sync-api',
    'typescript',
    'runtime',
  'contributing',
  'projects',
  'editor-plugins',
  'blog',
  'about'
]

const ignoredPaths = [
  '/advanced/contributing',
  '/advanced/custom-loader',
  '/advanced/writing-a-plugin',
  '/getting-started/typescript',
  '/blog/custom-pragma',
  '/plugins',
  '/syntax'
]
/* eslint-enable prettier/prettier */

const pageNames = {
  index: 'Introduction',
  next: 'Next.js',
  ast: 'AST',
  projects: 'Projects using MDX',
  'getting-started': 'Getting started',
  'create-react-app': 'Create React App',
  'retext-plugins': 'Using retext plugins',
  'sync-api': 'Sync API',
  'live-code': 'Live code editor',
  'writing-a-plugin': 'Writing a plugin'
}

const sortRoutes = routes =>
  [
    ...sortBy([...routes], a => {
      const i = navOrder.indexOf(a.name)
      return i < 0 ? Infinity : i
    })
  ].map(route => {
    if (!pageNames[route.name]) return route
    return {
      ...route,
      name: pageNames[route.name]
    }
  })

export default class App extends React.Component {
  render() {
    const {routes} = this.props
    const nav = sortRoutes(routes).filter(
      route => !ignoredPaths.includes(route.path)
    )

    return (
      <RebassMDX>
        <ScopeProvider scope={scope}>
          <SidebarLayout {...this.props} logo={<Logo />} routes={nav} />
        </ScopeProvider>
      </RebassMDX>
    )
  }
}

App.defaultProps = {
  title: `MDX v${pkg.version}`
}
