import App from './App'
import React from 'react'
import express from 'express'
import { renderToString } from 'react-dom/server'

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

const server = express()

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const markup = renderToString(<App />)
    res.send(
      // prettier-ignore
      `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet='utf-8' />
        <title>Welcome to Razzle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${
          assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ''
        } 
    </head>
    <body>
        <div id="root">${markup}</div>    
        <script src="${assets.client.js}" defer crossorigin></script>
    </body>
</html>`
    )
  })

export default server
