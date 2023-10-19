'use strict'

const runtime = require('react/jsx-runtime')
const register = require('./lib/index.cjs')

// @ts-expect-error: the automatic react runtime is untyped.
register({...runtime})
