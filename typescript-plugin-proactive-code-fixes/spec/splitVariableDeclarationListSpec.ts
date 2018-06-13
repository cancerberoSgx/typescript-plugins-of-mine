import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil';

describe('splitVariableDeclarationList', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: `let i = 0, c = 's', arr = []` })
  })
  it('basic', async () => {
    basicTest(8, config, 'splitVariableDeclarationList', ['let c', 'let arr'], [`let i: number = 0; let c: string = 's'; let arr: any[] = [];`])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})

