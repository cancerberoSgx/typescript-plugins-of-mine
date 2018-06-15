const code = `
const a = 1

function f (){}

console.log(a+1)
f()

f()
`
import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult, getCodeFixOptionsForPredicate, getCodeFix } from './testUtil'
describe('removeEmptyLines', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('basic1', async () => {
    // const range = [1, 44]
    const text = `const a = 1
function f (){}
console.log(a+1)
f()

f()`
    const arg = getCodeFixOptionsForPredicate([1, 44], config)
    const fix = getCodeFix(arg, 'removeEmptyLines')
    expect(fix).toBeDefined()
    expect(config.newSourceFile.getText()).not.toContain(text)
    fix.apply(arg)
    expect(config.newSourceFile.getText()).toContain(text)
  })
  it('basic1', async () => {
    const text = `const a = 1
function f (){}
console.log(a+1)
f()
f()`
    const arg = getCodeFixOptionsForPredicate([1, 55], config)
    const fix = getCodeFix(arg, 'removeEmptyLines')
    expect(fix).toBeDefined()
    expect(config.newSourceFile.getText()).not.toContain(text)
    fix.apply(arg)
    expect(config.newSourceFile.getText()).toContain(text)
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})

