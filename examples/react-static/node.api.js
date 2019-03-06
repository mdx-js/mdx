export default () => ({
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
})
