import * as ts from 'typescript';
import { findAscendant, findChildContainingRangeLight, getNextSibling, getPreviousSibling, positionOrRangeToRange } from "typescript-ast-util";
import { create, Tool, ToolConfig } from "typescript-plugins-text-based-user-interaction";
import { SourceFile, SignaturedDeclaration, TypeGuards, NamedNode, Node } from 'ts-simple-ast';
import { CodeFix } from 'typescript-plugin-util';


export const PLUGIN_NAME = 'typescript-plugin-function-signature-refactors'
export const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`

export interface ReorderParametersTextUiConfig extends ToolConfig {
  printHelp: boolean,
  log: (msg) => void
}

let interactionTool: Tool

export function getTextUITool(config: { log: (msg) => void, program: ts.Program }): Tool {

  const reorderParamsTextUIConfig: ReorderParametersTextUiConfig = {
    prefix: '&%&%',
    printHelp: true,
    log: (msg) => {
      config.log(`${PLUGIN_NAME} interaction-tool ${msg}`)
    },
    actions: [
      {
        name: 'reorderParams',
        args: ['name', 'reorder'],
        print: action => `Reorder parameters of "${action.args.name}"`,
        snippet: (fileName: string, position: number): string | undefined => {
          let func = getFunction(fileName, position, config.program)
          if (!func || func.parameters && func.parameters.length <= 1) {
            return
          }
          const reorder = []
          for (let i = 0; i < func.parameters.length; i++) {
            reorder.push(func.parameters.length - i - 1)
          }
          return `reorderParams("${func.name.getText()}", [${reorder.join(', ')}])
  
  /* Help: The second argument is the new order of parameters. Number N in index M means move the M-th 
      argument to index N. Examples: 
   * [1] means switch between first and second
   * [3, 2] means move the first parameter to fourth position and move the second parameter to the third. 
   *   (the rest of the parameters, (third and fourth) will move left to accommodate this requirements) */`
        },

        // TODO: we could give a more intuitive text-based API by letting the user provide the new signature. Then we create a new function with that signature in order to parse it correctly. 
        nameExtra: (fileName: string, position: number) => {
          const func = getFunction(fileName, position, config.program)
          return func ? `of ${func.name.getText()}` : ''
        }
      }
    ]
  }
  if (!interactionTool) {
    interactionTool = create(reorderParamsTextUIConfig)
  }
  return interactionTool
}

function getFunction(fileName: string, position: number, program: ts.Program) {
  // TODO: cache
  const sourceFile = program.getSourceFile(fileName)
  const node = findChildContainingRangeLight(sourceFile, positionOrRangeToRange(position))
  if (!node) {
    return
  }
  const expr = findAscendant<ts.ExpressionStatement>(node, ts.isExpressionStatement, true)
  if (!expr) {
    return
  }
  return [getNextSibling(expr), getPreviousSibling(expr)].find(ts.isFunctionLike)
}

/** same as getFunction but in ts-simple-ast project */
export function getFunctionSimple(file: SourceFile, position: number, name: string): SignaturedDeclaration & NamedNode & Node | undefined {
  let expr = file.getDescendantAtPos(position)
  const e = [expr].concat(expr.getAncestors()).find(e => TypeGuards.isSignaturedDeclaration(e) && TypeGuards.isNamedNode(e) && e.getName() === name)
  if (TypeGuards.isSignaturedDeclaration(e) && TypeGuards.isNamedNode(e)) {
    return e
  }
}

class ReorderParams implements CodeFix {
  needSimpleAst?: boolean;
  name: string = 'reorderParams'
  config: any = {}
}

export const reorderParams = new ReorderParams()