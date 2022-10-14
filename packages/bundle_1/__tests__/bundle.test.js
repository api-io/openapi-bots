'use strict'

const bundle = require('..')
const assert = require('assert').strict

assert.strictEqual(bundle(), 'Hello from bundle')
console.info('bundle tests passed')
