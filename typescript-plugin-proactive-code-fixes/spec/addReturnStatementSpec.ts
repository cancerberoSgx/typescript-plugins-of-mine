import { getDiagnosticsInCurrentLocation } from 'typescript-ast-util';
import { codeFixes, CodeFixOptions } from '../src/codeFixes';
import { defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult, expectToContainFixer } from './testUtil';

describe('addReturnStatement', () => {
  let config: DefaultBeforeEachResult
  const log = (msg) => { };//console.log

  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: `function fffff(): number{}` })
  });

  it('basic', async () => {
    const position = 19
    const child = config.newSourceFile.getDescendantAtPos(position);
    const diagnostics = getDiagnosticsInCurrentLocation(config.simpleProject.getProgram().compilerObject, config.newSourceFile.compilerNode, position);
    const arg: CodeFixOptions = { diagnostics, containingTarget: child.compilerNode, containingTargetLight: child.compilerNode, log, simpleNode: child, program: config.simpleProject.getProgram().compilerObject, sourceFile: config.newSourceFile.compilerNode }
    const fixes = codeFixes.filter(fix => fix.predicate(arg));
    if (!fixes || !fixes.length) {
      return fail('no fixes found with true predicate');
    }
    const fix = expectToContainFixer(fixes, 'addReturnStatement')
    expect(!!fix.predicate(arg)).toBe(true)
    expect(config.newSourceFile.getText()).not.toContain(`return`)
    fix.apply(arg)
    expect(config.newSourceFile.getText()).toContain(`return`)
  })

  afterEach(() => {
    defaultAfterEach(config)
  })
});

