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

describe('implementInterfaceObjectLiteral', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('adding missing signatures', async () => {
    basicTest(8, config, 'implementInterfaceObjectLiteral', [`const tree1: Living = { name: '' }`])
  })
  it('removing strange signatures', async () => {
    basicTest(104, config, 'implementInterfaceObjectLiteral', [`const tree2: Living = { name: 'n' }`])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})
