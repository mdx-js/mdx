import React from 'react'
import {Helmet} from 'react-helmet'

export default ({title, description = 'Markdown for the component era'}) => {
  let fullTitle

  if (title === 'MDX') {
    fullTitle = title
  } else {
    fullTitle = title + ' | MDX'
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
    </Helmet>
  )
}
