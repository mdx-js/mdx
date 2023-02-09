/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {import('mdast-util-mdx').MdxJsxAttribute} MdxJsxAttribute
 * @typedef {import('mdast-util-mdx').MdxJsxAttributeValueExpression} MdxJsxAttributeValueExpression
 * @typedef {import('mdast-util-mdx').MdxJsxExpressionAttribute} MdxJsxExpressionAttribute
 */

import {test} from 'uvu'
import * as assert from 'uvu/assert'
import {u} from 'unist-builder'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import {removePosition} from 'unist-util-remove-position'
import {visit} from 'unist-util-visit'
import remarkMdx from '../index.js'

const basic = unified().use(remarkParse).use(remarkMdx)

test('parse: basics', () => {
  assert.equal(
    clean(basic.parse('Alpha <b/> charlie.')),
    u('root', [
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxJsxTextElement', {name: 'b', attributes: []}, []),
        u('text', ' charlie.')
      ])
    ]),
    'should parse a self-closing tag'
  )

  assert.equal(
    clean(basic.parse('Alpha <b></b> charlie.')),
    u('root', [
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxJsxTextElement', {name: 'b', attributes: []}, []),
        u('text', ' charlie.')
      ])
    ]),
    'should parse an opening and a closing tag'
  )

  assert.equal(
    clean(basic.parse('Alpha <></> charlie.')),
    u('root', [
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxJsxTextElement', {name: null, attributes: []}, []),
        u('text', ' charlie.')
      ])
    ]),
    'should parse fragments'
  )

  assert.equal(
    clean(basic.parse('Alpha <b>*bravo*</b> charlie.')),
    u('root', [
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxJsxTextElement', {name: 'b', attributes: []}, [
          u('emphasis', [u('text', 'bravo')])
        ]),
        u('text', ' charlie.')
      ])
    ]),
    'should parse markdown inside tags'
  )

  assert.equal(
    clean(basic.parse('Alpha {1 + 1} charlie.')),
    u('root', [
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxTextExpression', {data: {estree: null}}, '1 + 1'),
        u('text', ' charlie.')
      ])
    ]),
    'should parse expressions'
  )
})

test('stringify', () => {
  const basic = unified().use(remarkStringify).use(remarkMdx)

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: null, attributes: []}, []),
          u('text', ' charlie.')
        ])
      ])
    ),
    'Alpha <></> charlie.\n',
    'should serialize an empty nameless fragment'
  )

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'b', attributes: []}, []),
          u('text', ' charlie.')
        ])
      ])
    ),
    'Alpha <b /> charlie.\n',
    'should serialize a tag with a name'
  )

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {name: 'b', attributes: [u('mdxJsxAttribute', {name: 'bravo'})]},
            []
          ),
          u('text', ' charlie.')
        ])
      ])
    ),
    'Alpha <b bravo /> charlie.\n',
    'should serialize a boolean attribute (element)'
  )

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [u('mdxJsxAttribute', {name: 'bravo'}, 'bravo')]
            },
            []
          ),
          u('text', ' charlie.')
        ])
      ])
    ),
    'Alpha <b bravo="bravo" /> charlie.\n',
    'should serialize an attribute (element)'
  )

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [u('mdxJsxAttribute', {name: 'br:avo'}, 'bravo')]
            },
            []
          ),
          u('text', ' charlie.')
        ])
      ])
    ),
    'Alpha <b br:avo="bravo" /> charlie.\n',
    'should serialize a prefixed attribute (element)'
  )

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [u('mdxJsxExpressionAttribute', '...props')]
            },
            []
          ),
          u('text', ' charlie.')
        ])
      ])
    ),
    'Alpha <b {...props} /> charlie.\n',
    'should serialize a attribute expression (element)'
  )

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [
                u('mdxJsxAttribute', {
                  name: 'b',
                  value: u(
                    'mdxJsxAttributeValueExpression',
                    {data: {estree: undefined}},
                    '1 + 1'
                  )
                })
              ]
            },
            []
          ),
          u('text', ' charlie.')
        ])
      ])
    ),
    'Alpha <b b={1 + 1} /> charlie.\n',
    'should serialize an expression attribute (element)'
  )

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('link', {url: 'https://mdxjs.com'}, [
            u('text', 'https://mdxjs.com')
          ])
        ])
      ])
    ),
    '[https://mdxjs.com](https://mdxjs.com)\n',
    'should write out a url as the raw value'
  )

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: null, attributes: []}, [
            u('text', '1 < 3')
          ]),
          u('text', ' bravo.')
        ])
      ])
    ),
    'Alpha <>1 \\< 3</> bravo.\n',
    'should encode `<` in text'
  )

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: null, attributes: []}, [
            u('text', '1 { 3')
          ]),
          u('text', ' bravo.')
        ])
      ])
    ),
    'Alpha <>1 \\{ 3</> bravo.\n',
    'should encode `{` in text'
  )

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxTextExpression', ''),
          u('text', ' bravo.')
        ])
      ])
    ),
    'Alpha {} bravo.\n',
    'should serialize empty expressions'
  )

  assert.equal(
    basic.stringify(
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxTextExpression', '1 + 1'),
          u('text', ' bravo.')
        ])
      ])
    ),
    'Alpha {1 + 1} bravo.\n',
    'should serialize expressions'
  )
})

/**
 * @template {Root | Content} Tree
 * @param {Tree} tree
 * @returns {Tree}
 */
function clean(tree) {
  removePosition(tree, true)
  cleanEstree(tree)
  return tree
}

/**
 * @param {Root | Content} tree
 */
function cleanEstree(tree) {
  visit(tree, onvisit)

  /**
   * @param {Root | Content | MdxJsxAttribute | MdxJsxExpressionAttribute | MdxJsxAttributeValueExpression} node
   */
  function onvisit(node) {
    if (
      (node.type === 'mdxjsEsm' ||
        node.type === 'mdxTextExpression' ||
        node.type === 'mdxFlowExpression' ||
        node.type === 'mdxJsxAttribute' ||
        node.type === 'mdxJsxAttributeValueExpression' ||
        node.type === 'mdxJsxExpressionAttribute') &&
      node.data &&
      node.data.estree
    ) {
      node.data.estree = null
    }

    if (
      node.type === 'mdxJsxTextElement' ||
      node.type === 'mdxJsxFlowElement'
    ) {
      let index = -1

      while (++index < node.attributes.length) {
        const child = node.attributes[index]

        onvisit(child)

        if (child.value && typeof child.value === 'object') {
          onvisit(child.value)
        }
      }
    }
  }
}

test.run()
