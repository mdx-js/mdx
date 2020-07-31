import React from 'react'
import {Helmet} from 'react-helmet'
import {Favicon, Favicon16, Favicon32, Og, OgConf} from '../assets'

export default ({
  title,
  image,
  skipBreadcrumb,
  description = 'Markdown for the component era'
}) => {
  let fullTitle

  if (title === 'MDX' || skipBreadcrumb) {
    fullTitle = title
  } else {
    fullTitle = title + ' | MDX'
  }

  const imagePath = image === 'OgConf' ? OgConf : Og

  return (
    <Helmet
      defer={false}
      htmlAttributes={{lang: 'en'}}
      meta={[
        {
          name: 'description',
          content: description
        },
        {
          property: `og:title`,
          content: fullTitle
        },
        {
          property: `og:description`,
          content: description
        },
        {
          property: `og:type`,
          content: `website`
        },
        {
          property: 'og:image',
          content: imagePath
        },
        {
          name: `twitter:card`,
          content: `summary_large_image`
        },
        {
          name: `twitter:title`,
          content: fullTitle
        },
        {
          name: `twitter:description`,
          content: description
        },
        {
          name: 'twitter:image',
          content: imagePath
        }
      ]}
    >
      <title>{fullTitle}</title>
      <link rel="icon" type="image/png" sizes="32x32" href={Favicon32} />
      <link rel="icon" type="image/png" sizes="16x16" href={Favicon16} />
      <link rel="shortcut icon" href={Favicon} />
    </Helmet>
  )
}
