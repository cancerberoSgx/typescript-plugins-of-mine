const code = `interface SomeInterface {
  prop1: { s: string, n: Date }[]
}
class Class2 implements SomeInterface {
  prop1: boolean[]
}`
import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'

describe('implementInterfaceMember', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('fix member', async () => {
    basicTest(107, config, 'implementInterfaceMember', [`class Class2 implements SomeInterface { prop1: { s: string; n: Date; }[] }`])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})
