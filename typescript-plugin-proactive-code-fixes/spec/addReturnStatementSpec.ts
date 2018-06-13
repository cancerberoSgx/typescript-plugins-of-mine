import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'

describe('addReturnStatement', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: `function fffff(): number{}` })
  })
  it('basic', async () => {
    basicTest(19, config, 'addReturnStatement', [`return`])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})

