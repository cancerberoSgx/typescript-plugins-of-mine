const code = `
class C extends NonExistent implements NonExistentInterface, ExistentInterface{

}

class ExistentInterface{

}`

import { defaultBeforeEach, basicTest, DefaultBeforeEachResult, defaultAfterEach, defaultLog } from './testUtil'
import Project from 'ts-simple-ast';
import { getDiagnosticsInCurrentLocation } from 'typescript-ast-util';
import { CodeFixOptions, codeFixes } from '../src/typings';
import { declareClass } from '../src/code-fix/declareClass';

describe('declareClass', () => {
  it('Declare class when extending non existent', () => {
    const simpleProject = new Project({useVirtualFileSystem: true})
    const sourceFile = simpleProject.createSourceFile('foo.ts', code)
    const cursorPosition = code.indexOf('NonExistent')+2
    const diagnostics = getDiagnosticsInCurrentLocation(simpleProject.getProgram().compilerObject, sourceFile.compilerNode, cursorPosition);
    expect(diagnostics.find(d => d.code === 2304 && d.messageText.toString().includes('NonExistent'))).toBeDefined()
    const child = sourceFile.getDescendantAtPos(cursorPosition);
    const arg: CodeFixOptions = {
      diagnostics,
      containingTarget: child.compilerNode,
      containingTargetLight: child.compilerNode,
      log: defaultLog,
      simpleNode: child,
      simpleProject,
      program: simpleProject.getProgram().compilerObject,
      sourceFile: sourceFile.compilerNode
    }
    const fixes = codeFixes.filter(fix => fix.predicate(arg))
    const fix = fixes.find(f => f.name === declareClass.name)
    if (!fix) {
      return fail('fix predicate not working ' + declareClass.name);
    }
    const result = fix.apply(arg) as ts.RefactorEditInfo
    expect(result.edits[0].textChanges[0].newText.includes('class NonExistent'))
  })
});
