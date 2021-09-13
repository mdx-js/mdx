import path from 'path'

export default {
  getSiteData: () => ({
    title: 'React Static + MDX'
  }),
  // See <https://github.com/react-static/react-static/tree/master/packages/react-static-plugin-mdx>
  // for more info.
  plugins: [
    'react-static-plugin-mdx',
    [
      'react-static-plugin-source-filesystem',
      {
        location: path.resolve('./src/pages')
      }
    ],
    'react-static-plugin-reach-router'
  ]
}
