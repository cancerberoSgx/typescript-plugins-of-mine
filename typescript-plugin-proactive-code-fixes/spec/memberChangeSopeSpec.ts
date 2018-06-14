const code = `class A {
  private method(a: number):Date[]{
    return [new Date()]
  }
}
const a = new A()
new A().method(1)
a.method(2)`
import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'

describe('memberChangeScope', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('from new expression member access', async () => {
    basicTest(105, config, 'memberChangeScope', [`public method(`])
  })
  it('from variable member access', async () => {
    basicTest(116, config, 'memberChangeScope', [`public method(`])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})
