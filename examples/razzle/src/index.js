import express from 'express'
import app from './server'

if (module.hot) {
  module.hot.accept('./server', () => {
    console.log('🔁  HMR Reloading `./server`...')
  })
  console.info('✅  Server-side HMR Enabled!')
}

const port = process.env.PORT || 3000

export default express()
  .use((req, res) => app.handle(req, res))
  .listen(port, err => {
    if (err) {
      console.error(err)
      return
    }

    console.log(`> Started on port ${port}`)
  })
