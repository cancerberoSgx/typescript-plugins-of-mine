const code = `
let variable = 1
let variable = 's'
`
import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'
describe('variableRename', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('basic1', async () => {
    basicTest(10, config, 'variableRename', [`let variable2 = 1`])
  })
  it('basic2', async () => {
    basicTest(26, config, 'variableRename', [`let variable2 = 's'`])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})

