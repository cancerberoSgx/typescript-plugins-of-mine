const code = `const tree1: Living = {
}
interface Living {
  name: string
}
const tree2: Living = {
  name: 'n',
  dddd: 'hshs'
}`
import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'

describe('implementInterfaceObjectLitera', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('basic', async () => {
    basicTest(8, config, 'implementInterfaceObjectLiteral', [`const tree1: Living = { name: '' }`])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})

