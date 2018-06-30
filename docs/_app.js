import React from 'react'
import RebassMDX from '@rebass/mdx'
import sortBy from 'lodash.sortby'
import { Link } from 'react-router-dom'
import { SidebarLayout as Layout } from '@compositor/x0/components'
import { Flex, Box, Container } from 'rebass'

const navOrder = [
  'index',
  'introduction',
  'getting-started',
  'specification'
]

const pageNames = { index: 'Home' }

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
    const {
      routes,
      route,
      children,
    } = this.props
    const { layout } = (route && route.props) || {}

    const nav = sortRoutes(routes)

    return (
      <RebassMDX>
        <Layout
          {...this.props}
          routes={nav}
        />
      </RebassMDX>
    )
  }
}
