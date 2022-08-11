import {test} from 'uvu'
import * as assert from 'uvu/assert'
import {toValidIdentifierName} from '../lib/util/to-valid-identifier-name.js'

/** @param {string} invalidChar */
function toTestFailureMessage(invalidChar) {
  return `Invalid characters like "${invalidChar}" should be converted to underscores "_"`
}

test('toValidIdentifierName', () => {
  // Valid strings left untouched
  assert.equal(toValidIdentifierName('test'), 'test')
  assert.equal(toValidIdentifierName('camelCase'), 'camelCase')
  // Invalid cont character -> underscore
  assert.equal(
    toValidIdentifierName('custom-element'),
    'custom_element',
    toTestFailureMessage('-')
  )
  assert.equal(
    toValidIdentifierName('custom element'),
    'custom_element',
    toTestFailureMessage(' ')
  )
  // Invalid starting character -> underscore
  assert.equal(
    toValidIdentifierName('-badStarting'),
    '_badStarting',
    toTestFailureMessage('-')
  )
  assert.equal(
    toValidIdentifierName('1badStarting'),
    '_badStarting',
    toTestFailureMessage('1')
  )
  assert.equal(
    toValidIdentifierName(' badStarting'),
    '_badStarting',
    toTestFailureMessage(' ')
  )
  // Empty string -> underscore
  assert.equal('_', toValidIdentifierName(''))
})

test.run()
