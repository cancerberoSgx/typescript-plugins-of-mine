const code = `
class C extends NonExistent implements NonExistentInterface, ExistentInterface{

}

class ExistentInterface{

}`

import { defaultBeforeEach, basicTest, DefaultBeforeEachResult, defaultAfterEach } from './testUtil'

describe('declareClass', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config  = defaultBeforeEach({createNewFile: code})
  })
  it('Declare class when extending non existent', () => {
    basicTest(19, config, 'declareClass', [`class NonExistent {`])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
});
