const code = `
const template1 = \`hello \${name} we are "glad" \${'you'} have \${1 + 2 + 3} years old\` ;
const concat3 = 'hello ' + name
`

import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'

describe('template2Literal', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('basic', async () => {
    basicTest(40, config, 'template2Literal', [`+ " have " + (1 + 2 + 3) + " years old"`])
  })
  it('basic', async () => {
    basicTest(110, config, 'template2Literal', ['`hello ${rightText}`'])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})