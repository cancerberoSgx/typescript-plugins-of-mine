import { now } from 'hrtime-now';
import {
  findChild, findChildContainingRange, findIdentifier, getKindName, getTypeStringFor,
  hasDeclaredType, positionOrRangeToRange, positionOrRangeToNumber, isDeclaration, getTypeStringForDeclarations
} from 'typescript-ast-util';
import { getPluginCreate, createSimpleASTProject } from 'typescript-plugin-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { basename } from 'path';
import Project, { PropertySignature, TypeGuards, createWrappedNode, ClassDeclaration } from 'ts-simple-ast'
import { methodDelegateOnInterface, methodDelegateOnClass } from './methodDelegate';

const PLUGIN_NAME = 'typescript-plugin-method-delegate'
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
function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts_module.UserPreferences)
  : ts.ApplicableRefactorInfo[] {
  const t0 = now()
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange, userPreferences) || []
  const program = info.languageService.getProgram()
  const sourceFile = program.getSourceFile(fileName)
  if (!sourceFile) {
    return refactors
  }
  target = findChildContainingRange(sourceFile, positionOrRangeToRange(positionOrRange))
  if (!(target && [ts.SyntaxKind.PropertySignature, ts.SyntaxKind.PropertyDeclaration].includes(target.kind)))
   {
    info.project.projectService.logger.info(
      `${PLUGIN_NAME} no getEditsForRefactor because findChildContainedRange undefined, target.kind == ${
        getKindName(target.kind) + ' - ' + [ts.SyntaxKind.PropertySignature, ts.SyntaxKind.PropertyDeclaration].join(', ')}`)
    return refactors
  }
  if(![ts.SyntaxKind.PropertySignature, ts.SyntaxKind.PropertyDeclaration].includes(target.kind)){
    target = target.parent
  }
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
  actionName: string, userPreferences: ts_module.UserPreferences): ts.RefactorEditInfo | undefined {
  const t0 = now()
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, userPreferences)
  if (actionName != REFACTOR_ACTION_NAME || !target) {
    return refactors
  }
  try {
    const project = createSimpleASTProject(info.project)
    const descAtPo = project.getSourceFileOrThrow(fileName).getDescendantAtPos(positionOrRangeToNumber(positionOrRange))
    const typeDeclaration = descAtPo.getParent().getParent()
    const propertyDeclaration = descAtPo.getParent()
    if (TypeGuards.isInterfaceDeclaration(typeDeclaration) && TypeGuards.isPropertySignature(propertyDeclaration)) {
      methodDelegateOnInterface(typeDeclaration, propertyDeclaration)
      project.emit()
      project.saveSync();
    }
    else if (TypeGuards.isClassDeclaration(typeDeclaration) && TypeGuards.isPropertyDeclaration(propertyDeclaration)) {
      methodDelegateOnClass(typeDeclaration, propertyDeclaration)
      project.emit()
      project.saveSync();
    }
    else {
      info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor not executed because typeguards didn't applied for typeDeclaration:${typeDeclaration.getKindName()}, propertyDeclaration:${propertyDeclaration.getKindName()}`)
    }
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor took ${now() - t0}`)
  } catch (error) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor error: ${error.toString()} - stack: ${error.stack}`)
  }
  return refactors
}
