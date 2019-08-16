import React from 'react'
import {Helmet} from 'react-helmet'

export default ({title, description = 'Markdown for the component era'}) => (
  <Helmet>
    <title>{title ? title + ' | ' : ''}MDX</title>
    <meta name="description" content={description} />
  </Helmet>
)
