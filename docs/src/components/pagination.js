import React from 'react'
import {Location} from '@reach/router'
import css from '@styled-system/css'
import SidebarContent from './sidebar.mdx'

const flattenLinks = children =>
  React.Children.toArray(children).reduce((acc, child) => {
    if (child.props && child.props.mdxType === 'a') {
      return [...acc, child]
    }
    if (!child.props || !child.props.children) return acc
    return React.Children.toArray([
      ...acc,
      ...flattenLinks(child.props.children)
    ])
  }, [])

const PaginationWrapper = props => props.render(flattenLinks(props.children))

const removeSlash = str => str.replace(/\/$/, '')

export default () => (
  <Location
    children={({location}) => {
      return (
        <SidebarContent
          components={{
            wrapper: PaginationWrapper
          }}
          render={links => {
            const index = links.findIndex(
              link => link.props.href === removeSlash(location.pathname)
            )
            const previous = links[index - 1]
            const next = links[index + 1]

            return (
              <div
                css={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 5,
                  a: {
                    color: 'inherit',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: [2, 3],
                    '&:hover': {
                      color: 'primary'
                    }
                  }
                })}
              >
                {previous}
                {next}
              </div>
            )
          }}
        />
      )
    }}
  />
)
