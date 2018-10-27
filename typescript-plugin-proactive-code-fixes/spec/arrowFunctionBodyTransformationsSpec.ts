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
    basicTest(code.indexOf(`=> 'hello'`)+1, config, 'arrowFunctionTransformations', [`return 'hello' + o1`])
  })

  it('remove body ', async () => {
    basicTest(code.indexOf(`a => { return a - 1 + 2`)+1, config, 'arrowFunctionTransformations', [`bodied: a => a - 1 + 2 / 6,`])
  })  
  it('add body returning object literal', async () => {
    basicTest(code.indexOf(`=> ({ a, b: 'hi' })`)+1, config, 'arrowFunctionTransformations', [`=> { return { a, b: 'hi' }; }`])
  }) 
  
  afterEach(() => {
    defaultAfterEach(config)
  })
})
