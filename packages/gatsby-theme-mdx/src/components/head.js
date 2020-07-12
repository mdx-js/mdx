import React from 'react'
import {Helmet} from 'react-helmet'
import {Favicon, Favicon16, Favicon32} from '../assets'

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
      <link rel="icon" type="image/png" sizes="32x32" href={Favicon32} />
      <link rel="icon" type="image/png" sizes="16x16" href={Favicon16} />
      <link rel="shortcut icon" href={Favicon} />
      <meta name="description" content={description} />
    </Helmet>
  )
}
