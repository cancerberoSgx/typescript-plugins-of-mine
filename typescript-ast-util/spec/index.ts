// Be able to run individual specs (without having to comment all the others). Examples:
//
// $ node spec cliApiSpec
// $ node spec cliApiSpec,nodeApiSpec

const path = require('path')
const Jasmine = require('jasmine')

let specFiles = process.argv[2]
  .split(',')
  .map(f => path.join(__dirname, f))

const jasmineRunner = new Jasmine()
jasmineRunner.specFiles = specFiles
jasmineRunner.execute()

