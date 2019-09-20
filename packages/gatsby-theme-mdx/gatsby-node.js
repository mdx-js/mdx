const crypto = require(`crypto`)
const path = require(`path`)

let basePath = '/'
let contentPath = 'docs'

const DocTemplate = require.resolve('./src/templates/doc')

const mdxResolverPassthrough = fieldName => async (
  source,
  args,
  context,
  info
) => {
  const type = info.schema.getType(`Mdx`)
  const mdxNode = context.nodeModel.getNodeById({
    id: source.parent
  })

  const resolver = type.getFields()[fieldName].resolve
  const result = await resolver(mdxNode, args, context, {
    fieldName
  })

  return result
}

exports.sourceNodes = ({actions, schema}) => {
  const {createTypes} = actions

  createTypes(
    schema.buildObjectType({
      name: `Docs`,
      fields: {
        id: {type: `ID!`},
        title: {type: `String!`},
        description: {type: `String`},
        slug: {type: `String!`},
        headings: {
          type: `[MdxHeadingMdx!]`,
          resolve: mdxResolverPassthrough(`headings`)
        },
        excerpt: {
          type: `String!`,
          args: {
            pruneLength: {
              type: `Int`,
              defaultValue: 140
            }
          },
          resolve: mdxResolverPassthrough(`excerpt`)
        },
        body: {
          type: `String!`,
          resolve: mdxResolverPassthrough(`body`)
        }
      },
      interfaces: [`Node`]
    })
  )
}

exports.onCreateNode = ({node, actions, getNode, createNodeId}) => {
  const {createNode, createParentChildLink, createRedirect} = actions

  const isReadme = name => /readme/i.test(name)
  const isIndexPath = name => name === 'index' || isReadme(name)

  const toOriginalDocsPath = node => {
    const {dir} = path.parse(node.relativePath)
    const fullPath = [basePath, dir, node.name]
    return path.join(...fullPath)
  }

  const toDocsPath = node => {
    const {dir} = path.parse(node.relativePath)
    const fullPath = [
      basePath,
      dir,
      !isIndexPath(node.name) && node.name
    ].filter(Boolean)
    return path.join(...fullPath)
  }

  // Make sure it's an MDX node
  if (node.internal.type !== `Mdx`) {
    return
  }

  // Create source field (according to contentPath)
  const fileNode = getNode(node.parent)
  const source = fileNode.sourceInstanceName

  if (node.internal.type === `Mdx` && source === contentPath) {
    const slug = toDocsPath(fileNode)

    // Redirect file/path/readme to file/path/ in order to handle
    // potential links that are meant to work with GitHub-style index
    // pages.
    if (isReadme(fileNode.name)) {
      createRedirect({
        fromPath: toOriginalDocsPath(fileNode),
        toPath: toDocsPath(fileNode),
        isPermanent: true
      })
    }

    const title = node.frontmatter.title
    const description = node.frontmatter.description

    const fieldData = {title, description, slug}

    createNode({
      ...fieldData,
      id: createNodeId(`${node.id} >>> Docs`),
      parent: node.id,
      children: [],
      internal: {
        type: `Docs`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(fieldData))
          .digest(`hex`),
        content: JSON.stringify(fieldData),
        description: `Docs`
      }
    })

    createParentChildLink({parent: fileNode, child: node})
  }
}

exports.createPages = async ({graphql, actions, reporter}) => {
  const {createPage} = actions

  const result = await graphql(`
    {
      docs: allDocs {
        nodes {
          id
          slug
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panic(result.errors)
  }

  const docs = result.data.docs.nodes

  docs.forEach((doc, index) => {
    const previous = index === docs.length - 1 ? null : docs[index + 1]
    const next = index === 0 ? null : docs[index - 1]
    const {slug} = doc

    createPage({
      path: slug,
      component: DocTemplate,
      context: {
        ...doc,
        previous,
        next
      }
    })
  })
}

exports.onCreateWebpackConfig = ({actions}) => {
  actions.setWebpackConfig({
    node: {
      fs: 'empty'
    }
  })
}
