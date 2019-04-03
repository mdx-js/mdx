const heading = {
  a: {
    color: 'inherit',
    textDecoration: 'none'
  }
}

export default {
  colors: {
    text: '#000',
    background: '#fff',
    primary: '#33e',
    secondary: '#11a',
    gray: '#ccc',
    lightgray: '#f6f6f6',
    yellow: '#ffc'
  },
  fonts: {
    monospace: '"Roboto Mono", Menlo, monospace'
  },
  mediaQueries: {
    big: '@media screen and (min-width: 40em)'
  },
  styles: {
    h1: {
      ...heading,
      fontSize: [5, 6]
    },
    h2: {
      ...heading,
      fontSize: [4, 5]
    },
    h3: {
      ...heading,
      fontSize: [3, 4]
    },
    h4: {
      ...heading,
      fontSize: 3
    },
    h5: {
      ...heading,
      fontSize: 2
    },
    h6: {
      ...heading,
      fontSize: 1
    },
    a: {
      color: 'primary',
      '&:hover': {
        color: 'secondary'
      }
    },
    table: {
      width: '100%',
      my: 4,
      borderCollapse: 'separate',
      borderSpacing: 0
    },
    th: {
      textAlign: 'left',
      verticalAlign: 'bottom',
      paddingTop: '4px',
      paddingBottom: '4px',
      paddingRight: '4px',
      paddingLeft: 0,
      borderColor: 'inherit',
      borderBottomWidth: '2px',
      borderBottomStyle: 'solid'
    },
    td: {
      textAlign: 'left',
      verticalAlign: 'top',
      paddingTop: '4px',
      paddingBottom: '4px',
      paddingRight: '4px',
      paddingLeft: 0,
      borderColor: 'inherit',
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid'
    },
    inlineCode: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
      bg: 'lightgray'
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 1,
      overflowX: 'auto'
    },
    hr: {
      border: 0,
      borderBottom: '1px solid',
      my: 4,
      color: 'lightgray'
    },
    ul: {
      pl: 3
    }
  }
}
