const code = `
const o = {
  fn: o1 => 'hello' + o1,
  bodied: a => { return a - 1 + 2 / 6; },
  zeroArg: () => foo(),
  returningObjectLiteral: <T>(a) => ({ a, b: 'hi' })
}
`
import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil';

describe('arrowFunctionBodyTransformations', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('add body single arg no parenth', async () => {
    basicTest(30, config, 'arrowFunctionTransformations', `return 'hello' + o1`)
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})

