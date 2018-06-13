const code = `
const constant2 = 1;
constant2 = 2
`
import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil';

describe('const2let', () => {
  let config: DefaultBeforeEachResult
  // const log = (msg) => { }//console.log
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })

  it('basic', async () => {
    basicTest(25, config, 'const2let', `let constant2 = 1`)
  })

  afterEach(() => {
    defaultAfterEach(config)
  })
})

