const sourceFileText = `
/**
 * a fruit is a living thing, produced by trees
 */
class Fruit extends LivingThing  { // suggested from anywhere inside the class declaration
  /**
   * use undefined for 100% transparency
   */
  color: string | undefined
  /** shouldn't be exported */
  private creationDate: Date
  /**
   * will resolve when it's worthwhile
   */
  foo() {
    return Promise.resolve([['smile']])
  }
  /**
   * @param greet the greeting to show in all user's screens 
   */
  bar(greet: string): Promise<string[]> { return null }
}
const obj21 = { // suggested from anywhere inside the object literal expression
  color: 'red',
  creationDate: new Date(),
  foo: () => Promise.resolve([new Date()]),
  bar(greet: string): Promise<string[]> { return null }
}
`
import { codeFixes, CodeFixOptions, CodeFix } from '../src/codeFixes'
import { defaultBeforeEach, DefaultBeforeEachResult, expectToContainFixer, removeWhiteSpaces, defaultAfterEach } from './testUtil'

describe('declareInterface', () => {
  let config: DefaultBeforeEachResult
  const projectPath = `assets/sampleProject1_1_copy`
  const log = (msg) => { };//console.log

  beforeEach(() => {
    config = defaultBeforeEach({ projectPath, createNewFile: true })
    config.newSourceFile.addStatements(sourceFileText)
  });

  it('Declare variable fix', async () => {
    const child = config.newSourceFile.getDescendantAtPos(161);
    const arg: CodeFixOptions = { diagnostics: [], containingTarget: child.compilerNode, containingTargetLight: child.compilerNode, log, simpleNode: child, program: config.program, sourceFile: config.newSourceFile.compilerNode }
    const fixes = codeFixes.filter(fix => fix.predicate(arg));
    if (!fixes || !fixes.length) {
      return fail();
    }
    const fix = expectToContainFixer(fixes, 'extractInterface')
    expect(!!fix.predicate(arg)).toBe(true)
    expect(config.newSourceFile.getText()).not.toContain(`interface IFruit {`)  
    fix.apply(arg)
    expect(removeWhiteSpaces(config.newSourceFile.getText(), ' ')).toContain(`interface IFruit { /** * use undefined for 100% transparency */ color: string | undefined; /** * will resolve when it's worthwhile */ foo(): () => Promise<string[][]>; /** * @param greet the greeting to show in all user's screens */ bar(greet: string): Promise<string[]>; } /** * a fruit is a living thing, produced by trees */ class Fruit extends LivingThing implements IFruit { `)
  })

  it('Declare variable fix', async () => {
    const child = config.newSourceFile.getDescendantAtPos(641);
    const arg: CodeFixOptions = { diagnostics: [], containingTarget: child.compilerNode, containingTargetLight: child.compilerNode, log, simpleNode: child, program: config.program, sourceFile: config.newSourceFile.compilerNode }
    const fixes = codeFixes.filter(fix => fix.predicate(arg));
    if (!fixes || !fixes.length) {
      return fail();
    }
    const fix = expectToContainFixer(fixes, 'extractInterface')
    expect(!!fix.predicate(arg)).toBe(true)
    // expect(config.newSourceFile.getText()).not.toContain(`interface IFruit {`)  
    fix.apply(arg)
    // console.log(removeWhiteSpaces(config.newSourceFile.getText(), ' ') );
    
    expect(removeWhiteSpaces(config.newSourceFile.getText(), ' ')).toContain(`const obj21: Iobj21 = { // suggested from anywhere inside the object literal expression color: 'red', creationDate: new Date(), foo: () => Promise.resolve([new Date()]), bar(greet: string): Promise<string[]> { return null } } interface Iobj21 { color: string; creationDate: Date; foo(): Promise<Date[]>; bar(greet: string): Promise<string[]>;`)
  })

  afterEach(() => {
    defaultAfterEach(config)
  })
});

