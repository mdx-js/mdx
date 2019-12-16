const template = require('@babel/template').default
const {declare} = require('@babel/helper-plugin-utils')
const {startsWithCapitalLetter} = require('@mdx-js/util')

const IGNORED_COMPONENTS = ['MDXLayout']

const buildShortcodeFunction = () =>
  template.ast(
    `
  const mdxMakeShortcode = name => props => {
    console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
    return <div {...props}/>
  }
`,
    {
      plugins: ['jsx']
    }
  )

const shortcodeTemplate = template(`
  const IDENTIFIER = mdxMakeShortcode(STRING)
`)

class BabelPluginApplyMdxTypeProp {
  constructor() {
    const componentNames = []
    const importNames = []

    this.state = {componentNames, importNames}

    this.plugin = declare(api => {
      api.assertVersion(7)
      const {types: t} = api

      return {
        visitor: {
          Program: {
            exit(path) {
              const {
                node: {body}
              } = path

              const shortcodes = componentNames
                .filter(s => !IGNORED_COMPONENTS.includes(s))
                .filter(s => !importNames.includes(s))

              if (!shortcodes.length) {
                return
              }

              body.push(buildShortcodeFunction())

              shortcodes.map(shortcode => {
                body.push(
                  shortcodeTemplate({
                    IDENTIFIER: t.identifier(shortcode),
                    STRING: t.stringLiteral(shortcode)
                  })
                )
              })
            }
          },

          ImportDeclaration(path) {
            path.traverse({
              Identifier(path) {
                if (path.key === 'local') {
                  importNames.push(path.node.name)
                }
              }
            })
          },

          JSXOpeningElement(path) {
            const jsxName = path.node.name.name

            if (startsWithCapitalLetter(jsxName)) {
              componentNames.push(jsxName)

              path.node.attributes.push(
                t.jSXAttribute(
                  t.jSXIdentifier(`mdxType`),
                  t.stringLiteral(jsxName)
                )
              )
            }
          }
        }
      }
    })
  }
}

module.exports = BabelPluginApplyMdxTypeProp
