# MDX Embed

With [MDX Embed](https://www.mdx-embed.com/) you can [politely embed](https://www.gatsbyjs.com/blog/hacktoberfest-spotlight-mdx-embed/) and load 3rd party media content such as Twitter, CodePen, CodeSandbox, Egghead Lessons, Gists and many more in your `.mdx`, no **import** required!

## Install

```sh
npm install mdx-embed --save
```

## Setup

Wrap your application with the `MDXEmbedProvider` to allow your `.mdx` to render all of the provided components

```javascript
import React from 'react'
import {MDXEmbedProvider} from 'mdx-embed'

export default props => <MDXEmbedProvider>{props.children}</MDXEmbedProvider>
```

### Usage

```mdx
<!-- some-mdx-file.mdx -->

#### My cool pen

Here's a pen, and some other blog post text

<CodePen codePenId="PNaGbb" />
```

For the full installation and information about the various MDX packages visit the [docs](https://www.mdx-embed.com)
