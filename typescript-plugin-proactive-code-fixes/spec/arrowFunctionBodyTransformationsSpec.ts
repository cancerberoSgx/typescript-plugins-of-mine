const code = `
const o = {
  fn: o1 => 'hello' + o1,
  bodied: a => { return a - 1 + 2 / 6; },
  zeroArg: () => foo(),
  returningObjectLiteral: <T>(a) => ({ a, b: 'hi' })
}
`
import { getDiagnosticsInCurrentLocation } from 'typescript-ast-util';
import { codeFixes, CodeFixOptions } from '../src/codeFixes';
import { defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult, expectToContainFixer } from './testUtil';

describe('arrowFunctionBodyTransformations', () => {
  let config: DefaultBeforeEachResult
  const log = (msg) => { }//console.log
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('add body single arg no parenth', async () => {
    const position = 30
    const child = config.newSourceFile.getDescendantAtPos(position)
    const diagnostics = getDiagnosticsInCurrentLocation(config.simpleProject.getProgram().compilerObject, config.newSourceFile.compilerNode, position)
    const arg: CodeFixOptions = { diagnostics, containingTarget: child.compilerNode, containingTargetLight: child.compilerNode, log, simpleNode: child, program: config.simpleProject.getProgram().compilerObject, sourceFile: config.newSourceFile.compilerNode }
    const fixes = codeFixes.filter(fix => fix.predicate(arg))

    // console.log(child.getKindName(), diagnostics, fixes)
    if (!fixes || !fixes.length) {
      return fail('no fixes found with true predicate')
    }
    const fix = expectToContainFixer(fixes, 'arrowFunctionTransformations')
    expect(!!fix.predicate(arg)).toBe(true)
    expect(config.newSourceFile.getText()).not.toContain(`return 'hello' + o1`)
    fix.apply(arg)
    expect(config.newSourceFile.getText()).toContain(`return 'hello' + o1`)
  })

  afterEach(() => {
    defaultAfterEach(config)
  })
})

