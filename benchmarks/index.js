const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

const basic = require('./basic')

const results = []
suite
  .add('basic', basic)
  .on('cycle', e => {
    results.push(e.target.toString())
  })
  .on('error', function (e) {
    console.error(e.target.error)
    process.exit(1)
  })
  .on('complete', function () {
    console.log('Benchmark complete')
  })
  .run({
    async: true
  })
