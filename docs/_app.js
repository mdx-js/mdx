import React from 'react'
import RebassMDX from '@rebass/mdx'
import * as Rebass from 'rebass'
import sortBy from 'lodash.sortby'
import { Link } from 'react-router-dom'
import { SidebarLayout as Layout } from '@compositor/x0/components'
import { Flex, Box, Container } from 'rebass'

const navOrder = [
  'index',
  'syntax',
  'getting-started',
    'webpack',
    'parcel',
    'next',
    'create-react-app',
    'gatsby',
    'x0',
  'plugins',
    'ast',
    'markdown',
    'hyperscript',
  'about',
  'specification'
]

const pageNames = {
  index: 'Home',
  next: 'Next.js',
  ast: 'AST',
  'getting-started': 'Getting Started',
  'create-react-app': 'Create React App'
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
      <RebassMDX components={Rebass}>
        <Layout
          {...this.props}
          routes={nav}
        />
      </RebassMDX>
    )
  }
}
