/**
 * @typedef {import('mdast').Nodes} Nodes
 * @typedef {import('mdast-util-mdx').MdxJsxAttribute} MdxJsxAttribute
 * @typedef {import('mdast-util-mdx').MdxJsxAttributeValueExpression} MdxJsxAttributeValueExpression
 * @typedef {import('mdast-util-mdx').MdxJsxExpressionAttribute} MdxJsxExpressionAttribute
 */

import assert from 'node:assert/strict'
import {test} from 'node:test'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import {unified} from 'unified'
import {u} from 'unist-builder'
import {removePosition} from 'unist-util-remove-position'
import {visit} from 'unist-util-visit'

const basic = unified().use(remarkParse).use(remarkMdx)

test('remark-mdx: core', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('remark-mdx')).sort(), [
      'default'
    ])
  })
})

test('remark-mdx: parse', async function (t) {
  await t.test('should parse a self-closing tag', function () {
    const tree = basic.parse('Alpha <b/> charlie.')

    clean(tree)

    assert.deepEqual(
      tree,
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'b', attributes: []}, []),
          u('text', ' charlie.')
        ])
      ])
    )
  })

  await t.test('should parse an opening and a closing tag', function () {
    const tree = basic.parse('Alpha <b></b> charlie.')

    clean(tree)

    assert.deepEqual(
      tree,
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'b', attributes: []}, []),
          u('text', ' charlie.')
        ])
      ])
    )
  })

  await t.test('should parse fragments', function () {
    const tree = basic.parse('Alpha <></> charlie.')

    clean(tree)

    assert.deepEqual(
      tree,
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: null, attributes: []}, []),
          u('text', ' charlie.')
        ])
      ])
    )
  })

  await t.test('should parse markdown inside tags', function () {
    const tree = basic.parse('Alpha <b>*bravo*</b> charlie.')

    clean(tree)

    assert.deepEqual(
      tree,
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'b', attributes: []}, [
            u('emphasis', [u('text', 'bravo')])
          ]),
          u('text', ' charlie.')
        ])
      ])
    )
  })

  await t.test('should parse expressions', function () {
    const tree = basic.parse('Alpha {1 + 1} charlie.')

    clean(tree)

    assert.deepEqual(
      tree,
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxTextExpression', {data: {estree: undefined}}, '1 + 1'),
          u('text', ' charlie.')
        ])
      ])
    )
  })
})

test('remark-mdx: stringify', async function (t) {
  const basic = unified().use(remarkStringify).use(remarkMdx)

  await t.test('should serialize an empty nameless fragment', function () {
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
      'Alpha <></> charlie.\n'
    )
  })

  await t.test('should serialize a tag with a name', function () {
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
      'Alpha <b /> charlie.\n'
    )
  })

  await t.test('should serialize a boolean attribute (element)', function () {
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
      'Alpha <b bravo /> charlie.\n'
    )
  })

  await t.test('should serialize an attribute (element)', function () {
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
      'Alpha <b bravo="bravo" /> charlie.\n'
    )
  })

  await t.test('should serialize a prefixed attribute (element)', function () {
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
      'Alpha <b br:avo="bravo" /> charlie.\n'
    )
  })

  await t.test(
    'should serialize a attribute expression (element)',
    function () {
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
        'Alpha <b {...props} /> charlie.\n'
      )
    }
  )

  await t.test(
    'should serialize an expression attribute (element)',
    function () {
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
        'Alpha <b b={1 + 1} /> charlie.\n'
      )
    }
  )

  await t.test('should write out a url as the raw value', function () {
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
      '[https://mdxjs.com](https://mdxjs.com)\n'
    )
  })

  await t.test('should encode `<` in text', function () {
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
      'Alpha <>1 \\< 3</> bravo.\n'
    )
  })

  await t.test('should encode `{` in text', function () {
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
      'Alpha <>1 \\{ 3</> bravo.\n'
    )
  })

  await t.test('should serialize empty expressions', function () {
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
      'Alpha {} bravo.\n'
    )
  })

  await t.test('should serialize expressions', function () {
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
      'Alpha {1 + 1} bravo.\n'
    )
  })
})

/**
 * @param {Nodes} tree
 *   Tree.
 * @returns {undefined}
 *   Nothing.
 */
function clean(tree) {
  removePosition(tree, {force: true})
  visit(tree, onvisit)
}

/**
 * @param {MdxJsxAttribute | MdxJsxAttributeValueExpression | MdxJsxExpressionAttribute | Nodes} node
 *   Node.
 * @returns {undefined}
 *   Nothing.
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
    'estree' in node.data &&
    node.data.estree
  ) {
    node.data.estree = undefined
  }

  if (node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') {
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
