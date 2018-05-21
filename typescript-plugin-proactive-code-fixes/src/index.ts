import { now } from 'hrtime-now';
import { findChildContainingRange, getKindName, positionOrRangeToNumber, positionOrRangeToRange } from 'typescript-ast-util';
import { createSimpleASTProject, getPluginCreate } from 'typescript-plugin-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';


const PLUGIN_NAME = 'typescript-plugin-proactive-code-fixes'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`
let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo

const pluginDefinition = { getApplicableRefactors, getEditsForRefactor }

export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  ts = modules.typescript
  info = anInfo
  info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
})

let target: ts.Node | undefined
function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange)
  : ts.ApplicableRefactorInfo[] {
  const t0 = now()
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []
  const program = info.languageService.getProgram()
  const sourceFile = program.getSourceFile(fileName)
  if (!sourceFile) {
    return refactors
  }
  target = findChildContainingRange(sourceFile, positionOrRangeToRange(positionOrRange))
  if (!target) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} no getEditsForRefactor because findChildContainedRange undefined, target.kind == ${getKindName(target.kind) + ' - ' + [ts.SyntaxKind.PropertySignature, ts.SyntaxKind.PropertyDeclaration].join(', ')}`)
    return refactors
  }

  // const sourceFile = simpleProject.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
  //   const fn = sourceFile.getFunction('main');
  //   const cursorPosition = 61




    // const dignostics = getDiagnosticsInCurrentLocation(program, sourceFile.compilerNode, cursorPosition);
    // if (!dignostics || !dignostics.length) {
    //   return fail();
    // }
    // const diag = dignostics[0];
    // const child = sourceFile.getDescendantAtPos(cursorPosition);
    // const fixes = codeFixes.filter(fix => fix.predicate(diag, child.compilerNode));
    // if (!fixes || !fixes.length) {
    //   return fail();
    // }
    // fixes[0].apply(diag, child);
    // simpleProject.saveSync();
    // simpleProject.emit();
    // expect(shell.cat(`${projectPath}/src/index.ts`).toString()).toContain('const i=f()')




  const name = (target as ts.NamedDeclaration).name && (target as ts.NamedDeclaration).name.getText() || ''
  refactors.push({
    name: `${PLUGIN_NAME}-refactor-info`,
    description: 'Add type',
    actions: [
      { name: REFACTOR_ACTION_NAME, description: 'Delegate methods to property"' + name + '"' }
    ],
  })
  info.project.projectService.logger.info(`${PLUGIN_NAME} getApplicableRefactors took ${now() - t0}`)
  return refactors
}

function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts.TextRange, refactorName: string,
  actionName: string): ts.RefactorEditInfo | undefined {
  const t0 = now()
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
  if (actionName != REFACTOR_ACTION_NAME || !target) {
    return refactors
  }
  try {
    const project = createSimpleASTProject(info.project)
    const descAtPo = project.getSourceFileOrThrow(fileName).getDescendantAtPos(positionOrRangeToNumber(positionOrRange))
    const typeDeclaration = descAtPo.getParent().getParent()
    const propertyDeclaration = descAtPo.getParent()
    // if (TypeGuards.isInterfaceDeclaration(typeDeclaration) && TypeGuards.isPropertySignature(propertyDeclaration)) {
    //   methodDelegateOnInterface(typeDeclaration, propertyDeclaration)
    //   project.emit()
    //   project.saveSync();
    // }
    // else if (TypeGuards.isClassDeclaration(typeDeclaration) && TypeGuards.isPropertyDeclaration(propertyDeclaration)) {
    //   methodDelegateOnClass(typeDeclaration, propertyDeclaration)
    //   project.emit()
    //   project.saveSync();
    // }
    // else {
    //   info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor not executed because typeguards didn't applied for typeDeclaration:${typeDeclaration.getKindName()}, propertyDeclaration:${propertyDeclaration.getKindName()}`)
    // }
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor took ${now() - t0}`)
  } catch (error) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor error: ${error.toString()} - stack: ${error.stack}`)
  }
  return refactors
}



