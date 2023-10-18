import assert from 'node:assert/strict'
import {test} from 'node:test'

test('@mdx-js/mdx: core', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('@mdx-js/mdx')).sort(), [
      'compile',
      'compileSync',
      'createProcessor',
      'evaluate',
      'evaluateSync',
      'nodeTypes',
      'run',
      'runSync'
    ])
  })
})
