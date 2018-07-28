import React from 'react'
import RebassMDX from '@rebass/mdx'
import createScope from '@rebass/markdown'
import * as Rebass from 'rebass'
import sortBy from 'lodash.sortby'
import { SidebarLayout, ScopeProvider } from '@compositor/x0/components'

import { LiveEditor, Logo } from './_ui'

const scope = { ...createScope(), ...Rebass, code: LiveEditor, pre: ({ children }) => children }

const navOrder = [
  'index',
  'getting-started',
    'webpack',
    'parcel',
    'next',
    'create-react-app',
    'gatsby',
    'x0',
  'syntax',
  'plugins',
  'advanced',
    'ast',
    'components',
    'writing-a-plugin',
    'custom-loader',
    'specification',
    'runtime',
  'projects',
  'about'
]

const pageNames = {
  index: 'Introduction',
  next: 'Next.js',
  ast: 'AST',
  projects: 'Projects Using MDX',
  'getting-started': 'Getting Started',
  'create-react-app': 'Create React App',
  'writing-a-plugin': 'Writing a Plugin'
}

const sortRoutes = routes => [
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
  static defaultProps = {
    title: 'MDX'
  }

  render () {
    const { routes } = this.props
    const nav = sortRoutes(routes)

    return (
      <RebassMDX>
        <ScopeProvider scope={scope}>
          <SidebarLayout
            {...this.props}
            logo={<Logo />}
            routes={nav}
          />
        </ScopeProvider>
      </RebassMDX>
    )
  }
}
