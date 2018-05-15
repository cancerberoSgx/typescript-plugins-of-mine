
import { findParentFromPosition, positionOrRangeToNumber, getKindName, findChild } from 'typescript-ast-util'
import * as ts_module from 'typescript/lib/tsserverlibrary'
import {getPluginCreate} from 'typescript-plugin-util'
import Project from "ts-simple-ast";
import { now } from 'hrtime-now'
import * as shell from 'shelljs'
import { basename } from 'path'
import {create} from 'xinquirer'
import { ACTION_TYPE } from 'xinquirer/dist/src/types';

import { InputQuestion } from 'xinquirer/dist/src/actions/input';


const PLUGIN_NAME = 'typescript-plugin-move-class'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-move-class`


let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo

const pluginDefinition = { getApplicableRefactors, getEditsForRefactor }

export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  ts = modules.typescript
  info = anInfo
  info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
})



let selectedDef: ts.ReferencedSymbol | undefined

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange): ts_module.ApplicableRefactorInfo[] {
  const t0 = now()
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []
  const refs = info.languageService.findReferences(fileName, positionOrRangeToNumber(positionOrRange))
  if (!refs || !refs.length) {
    return refactors
  }
  const selectedDefs: ts.ReferencedSymbol[] = refs.filter(r =>
    r.definition && r.definition.kind === ts.ScriptElementKind.classElement && r.definition.fileName === fileName)
  if (!selectedDefs || !selectedDefs.length) {
    return refactors
  }
  selectedDef = selectedDefs[0]
  refactors.push({
    name: `${PLUGIN_NAME}-move-class`,
    description: 'move class',
    actions: [
      { name: REFACTOR_ACTION_NAME, description: '***move class ' + selectedDef.definition.name }
    ],
  })

  info.project.projectService.logger.info(`${PLUGIN_NAME} getApplicableRefactors took ${now() - t0}`)
  return refactors
}


function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts_module.TextRange, refactorName: string,
  actionName: string): ts.RefactorEditInfo | undefined {
  const t0 = now()

  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
  if (actionName != REFACTOR_ACTION_NAME) {
    return refactors
  }
  // find the first parent that is a class declaration starting from given position
  const targetNode = findParentFromPosition(info, fileName, positionOrRange,
    parent => parent.kind === ts.SyntaxKind.ClassDeclaration)
  if (!targetNode) {
    return refactors
  }
  const project = new Project({
    tsConfigFilePath: getConfigFilePath(info.project)
  });
  const targetSourceFile = project.getSourceFile(targetNode.getSourceFile().fileName)
  const name = (targetNode as ts.ClassDeclaration).name
  const simpleClass = targetSourceFile.getClass((targetNode as ts.ClassDeclaration).name.getText())

  async function inquire(){
    const inquirer = create()
    await inquirer.start()

    const answers = await inquirer.prompt([
      {
        id: 'email', type: ACTION_TYPE.INPUT,
        title: 'Enter your Email',
        message: 'Please enter your email:',
        placeholder: 'example@server.com',
        button: 'Thanks',
        inputType: 'text'
      } 
    ]as [InputQuestion])
    console.log(`email entered:  `, answers[0].value)
    return await inquirer.stop()
  }
  inquire()


  const newText = 'kjasjhksadjkdsakj: '+getKindName(targetNode.kind)+'- '+(targetNode as ts.ClassDeclaration).name.getText()+'+'+(targetNode as ts.ClassDeclaration).name.escapedText
  if (targetNode && newText) {
    // const targetSourceFile = targetNode.getSourceFile()
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor took ${now() - t0}`)
    return {
      edits: [{
        fileName,
        textChanges: [{
          span: { start: targetSourceFile.getEnd(), length: newText.length },
          newText: newText
        }],
      }],
      renameFilename: undefined,
      renameLocation: undefined,
    }
  }
  else {
    return refactors
  }

}


/**dirty way of getting path to cnofig file of given program */
function getConfigFilePath(project: ts_module.server.Project){
  return project.getFileNames().find(p=>basename(p.toString())==='tsconfig.json')
}
/** dirty way of creating a ts-simple-ast Project from an exiting ts.server.Project */
function createSimpleASTProject(project: ts_module.server.Project){
  return new Project({
    tsConfigFilePath: getConfigFilePath(info.project)
  });
}
