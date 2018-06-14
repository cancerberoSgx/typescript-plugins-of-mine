const code = `
const variableString1 = 'hello world'
const variableString2 = "hello world"
`
import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'
describe('stringChangeQuoteChar', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('simple2double', async () => {
    basicTest(30, config, 'stringChangeQuoteChar', [`variableString1 = "hello world"`])
  })
  it('double2simple', async () => {
    basicTest(70, config, 'stringChangeQuoteChar', [`variableString2 = 'hello world'`])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})

