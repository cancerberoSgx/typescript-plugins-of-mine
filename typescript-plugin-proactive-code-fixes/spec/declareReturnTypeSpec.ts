const code = `function fn<T>(): FNResult<T> {
  return { a: 1, b: 's', log: (msg) => msg+'', kill: function <T>() { return 1 } }
}
`
import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'

describe('declareReturnType', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('basic', async () => {
    basicTest(20, config, 'declareReturnType', [`interface FNResult<T> { /** * TODO: Document me */ a: number; /** * TODO: Document me */ b: string; /** * TODO: Document me */ log(msg: any): string; /** * TODO: Document me */ kill<T>(): number; }`])
  })
  //TODO: test other cases - there are some failing currently 
  afterEach(() => {
    defaultAfterEach(config)
  })
})