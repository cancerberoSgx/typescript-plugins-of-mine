const code = `
const template1 = \`hello \${name} we are "glad" \${'you'} have \${1 + 2 + 3} years old\` ;
const concat1 = 'hello ' + name
const concat2 = 'hello ' + name + '. Have a good ' + day
const concat3 = 'hello ' + name + '. Have a good ' + day + \` and thanks for \${verb1} \${subject1}\. \`
`

import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'

describe('template2Literal', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('to string concat', async () => {
    basicTest(40, config, 'template2Literal', [`+ " have " + (1 + 2 + 3) + " years old"`])
  })
  it('to template basic', async () => {
    basicTest(110, config, 'template2Literal', ['const concat1 = `hello ${name}`'])
  })
  it('to template complex concat', async () => {
    basicTest(145, config, 'template2Literal', ['const concat2 = `hello ${name}. Have a good ${day}` const concat3'])
  })
  //TODO: make the other complex case concat3
  afterEach(() => {
    defaultAfterEach(config)
  })
})