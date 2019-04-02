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
    gray: '#f6f6f6'
  },
  styles: {
    h1: {
      ...heading,
      fontSize: [4, 5, 6]
    },
    h2: {
      ...heading,
      fontSize: [3, 4]
    },
    h3: {
      ...heading,
      fontSize: 3
    },
    h4: {
      ...heading,
      fontSize: 2
    },
    h5: {
      ...heading,
      fontSize: 1
    },
    h6: {
      ...heading,
      fontSize: 0
    },
    a: {
      color: 'primary',
      '&:hover': {
        color: 'secondary'
      }
    },
    table: {},
    th: {},
    td: {},
    code: {
      fontSize: 1,
      overflowX: 'auto'
    }
  }
}
