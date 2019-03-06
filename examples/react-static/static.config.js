import axios from 'axios'

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
        path: '/blog',
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
  webpack: config => {
    config.module.rules.map(rule => {
      if (
        typeof rule.test !== 'undefined' ||
        typeof rule.oneOf === 'undefined'
      ) {
        return rule
      }

      rule.oneOf.unshift({
        test: /.mdx$/,
        use: ['babel-loader', '@mdx-js/loader']
      })

      return rule
    })
    return config
  }
}
