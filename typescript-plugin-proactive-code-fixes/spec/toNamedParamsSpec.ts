const createNewFile = `
function foo(a: string[][], b: {o: {u: Date[]}}, c: number=4) : FooOptions){}
`
import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil';

describe('tonamedParams', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile })
  });

  it('basic', async () => {
    basicTest(41, config, 'toNamedParameters', `interface IFruit {`, `interface Foo { a: string[][]; b: {o: {u: Date[]}}; c: number; } function foo({a, b, c = 4}: Foo) : FooOptions){}`)
  })

  afterEach(() => {
    defaultAfterEach(config)
  })
});

