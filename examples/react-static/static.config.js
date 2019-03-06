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
  }
}
