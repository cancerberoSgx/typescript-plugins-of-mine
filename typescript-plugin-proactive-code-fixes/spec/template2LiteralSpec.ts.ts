const code = `\`hello \${name} we are "glad" \${'you'} have \${1 + 2 + 3} years old\``

import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'

describe('template2Literal', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('basic', async () => {
    basicTest(20, config, 'template2Literal', [`+ " have " + (1 + 2 + 3) + " years old"`])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})