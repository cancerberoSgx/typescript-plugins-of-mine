const createNewFile = `
function foo(a: string[][], b: {o: {u: Date[]}}, c: number=4) : FooOptions){}
`
import { codeFixes, CodeFixOptions, CodeFix } from '../src/codeFixes'
import { defaultBeforeEach, DefaultBeforeEachResult, expectToContainFixer, removeWhiteSpaces, defaultAfterEach, basicTest } from './testUtil'

describe('tonamedParams', () => {
  let config: DefaultBeforeEachResult
  // const projectPath = `assets/sampleProject1_1_copy`
  // const log = (msg) => { };//console.log

  beforeEach(() => {
    config = defaultBeforeEach({  createNewFile  })
  });

  it('basic', async () => {
      basicTest(41, config, 'toNamedParameters', `interface IFruit {`, `interface Foo { a: string[][]; b: {o: {u: Date[]}}; c: number; } function foo({a, b, c = 4}: Foo) : FooOptions){}`)


    // const child = config.newSourceFile.getDescendantAtPos(41);
    // const arg: CodeFixOptions = { diagnostics: [], containingTarget: child.compilerNode, containingTargetLight: child.compilerNode, log, simpleNode: child, program: config.simpleProject.getProgram().compilerObject, sourceFile: config.newSourceFile.compilerNode }
    // const fixes = codeFixes.filter(fix => fix.predicate(arg));
    // if (!fixes || !fixes.length) {
    //   return fail();
    // }
    // const fix = expectToContainFixer(fixes, 'toNamedParameters')
    // expect(!!fix.predicate(arg)).toBe(true)
    // expect(config.newSourceFile.getText()).not.toContain(`interface IFruit {`)  
    // fix.apply(arg)
    // expect(removeWhiteSpaces(config.newSourceFile.getText(), ' ')).toContain(`interface Foo { a: string[][]; b: {o: {u: Date[]}}; c: number; } function foo({a, b, c = 4}: Foo) : FooOptions){}`)
  })

  afterEach(() => {
    defaultAfterEach(config)
  })
});

