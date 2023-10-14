'use strict'

const runtime = require('react/jsx-runtime')
const register = require('./lib/index.cjs')

// @ts-expect-error: JSX runtime is untyped.
register({...runtime})
