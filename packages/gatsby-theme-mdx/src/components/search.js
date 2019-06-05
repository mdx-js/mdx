import React, { useEffect, useRef } from 'react'
import { navigate } from 'gatsby'
import { css } from 'theme-ui'
import SearchIcon from './search-icon'

const loadJs = () => import('./docsearch.min.js')

const important = styles => {
  const next = {}
  for (const key in styles) {
    const value = styles[key]
    if (value && typeof value === 'object') {
      next[key] = important(value)
      continue
    }
    next[key] = value + ' !important'
  }
  return next
}

const styles = theme => important(css({
  display: 'flex',
  alignItems: 'center',
  // <3 CSS
  '.algolia-autocomplete': {
    '.ds-dropdown-menu': {
      '@media screen and (max-width:40em)': {
        position: 'fixed',
        top: '128px',
        right: 0,
        bottom: 0,
        left: 0,
        margin: 16,
        minWidth: 'calc(100vw - 32px)',
        backgroundColor: 'white',
      },
    }
  },
})(theme))

export default props => {
  const input = useRef(null)
  // Copied from Gatsby (MIT License)
  // https://github.com/gatsbyjs/gatsby/blob/30070ec9a9e678ab8f23adda952510938c09bfcb/www/src/components/search-form.js
  useEffect(() => {
    const initDocsearch = async () => {
      const docsearch = await loadJs()

      window.docsearch = docsearch.default
      window.docsearch({
        apiKey: 'a8077c5e74b2e215c450cffa97d15c9d',
        indexName: 'mdxjs',
        inputSelector: '.docsearch-input',
        debug: false,
        autocompleteOptions: {
          openOnFocus: true,
          autoselect: true,
          hint: false,
          keyboardShortcuts: ['s']
        }
      })

      const path = 'https://unpkg.com/docsearch.js@2.6.2/dist/cdn/docsearch.min.css'
      const link = document.createElement('link')
      link.setAttribute('rel', 'stylesheet')
      link.setAttribute('type', 'text/css')
      link.setAttribute('href', path)
      document.head.appendChild(link)
    }

    initDocsearch()

    const autocompleteSelected = e => {
      e.stopPropagation()
      const a = document.createElement(`a`)
      a.href = e._args[0].url
      const paths = a.pathname.split(`/`).filter(el => el !== ``)
      const slug = paths[paths.length - 1]
      const path = `#${slug}` === a.hash ? `${a.pathname}` : `${a.pathname}${a.hash}`
      if (input && input.current) {
        input.current.blur()
        input.current.value = ''
      }
      navigate(path)
    }

    window.addEventListener(
      'autocomplete:selected',
      autocompleteSelected,
      true
    )

    return () => {
      window.removeEventListener(
        'autocomplete:selected',
        autocompleteSelected,
        true
      )
    }
  }, [])

  return (
    <form css={styles}>
      <SearchIcon
        css={css({
          mr: - 24,
        })}
      />
      <label htmlFor='search'
        css={{
          position: 'absolute',
          height: 1,
          width: 1,
          overflow: 'hidden',
          clip: 'rect(1px, 1px, 1px, 1px)',
        }}>
        Search
      </label>
      <input
        id='search'
        type='search'
        ref={input}
        placeholder="Search"
        className="docsearch-input"
        title='Type `s` to search'
        css={theme => css({
          appearance: 'none',
          fontSize: 1,
          m: 0,
          p: 2,
          pl: 28,
          border: '1px solid',
          borderColor: theme.colors.gray,
          color: 'inherit',
          bg: 'transparent',
          borderRadius: 4,
          width: '100%',
          '&:focus': {
            outline: 'none',
            borderColor: theme.colors.primary,
          }
        })(theme)}
      />
    </form>
  )
}
