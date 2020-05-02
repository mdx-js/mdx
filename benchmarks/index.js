const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

const basic = require('./basic')

const results = []
suite
  .add('basic', basic)
  .on('cycle', e => {
    results.push(e.target.toString())
  })
  .on('complete', function () {
    console.log('Benchmark complete')
  })
  .run({
    async: true
  })
