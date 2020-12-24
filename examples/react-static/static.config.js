import axios from 'axios'
import path from 'path'

export default {
  getSiteData: () => ({
    title: 'React Static + MDX'
  }),
  getRoutes: async () => {
    const {data: posts} = await axios.get(
      'https://jsonplaceholder.typicode.com/posts'
    )
    return [
      {
        path: 'blog',
        getData: () => ({
          posts
        }),
        children: posts.map(post => ({
          path: `/post/${post.id}`,
          component: 'src/containers/Post',
          getData: () => ({
            post
          })
        }))
      }
    ]
  },
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
