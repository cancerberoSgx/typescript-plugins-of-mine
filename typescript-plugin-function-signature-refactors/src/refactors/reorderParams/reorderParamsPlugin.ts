import { NamedNode, Node, SignaturedDeclaration, SourceFile, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { findAscendant, findChildContainingRangeLight, getAscendants, getKindName, positionOrRangeToNumber, positionOrRangeToRange } from "typescript-ast-util";
import { CodeFixOptions } from 'typescript-plugin-util';
import { Action, create, Tool, ToolConfig } from "typescript-plugins-text-based-user-interaction";
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { PLUGIN_NAME, SignatureRefactorArgs, SignatureRefactorsCodeFix } from '../../refactors';
import { reorderParameters } from './reorderParams';

/**
 * # Description
 * 
 *  Allows users to change a signature parameter order. 
 * 
 * # TODO
 *  * refactor a implementation method wont change its interface signature - super 
 *  * constructors not supported
 */
export class ReorderParamsCodeFixImpl implements SignatureRefactorsCodeFix {

  private interactionTool: Tool

  name: string = PLUGIN_NAME + '-reorderParams'

  config: any = {
    // print a comment with help on the autocomplete suggestion
    help: false
  }

  selectedAction?: Action;

  constructor(private options: SignatureRefactorArgs) {
  }

  description(arg: CodeFixOptions): string {
    return this.name
  }

  apply(arg: CodeFixOptions): void | ts.ApplicableRefactorInfo[] {
    const sourceFile = arg.simpleNode.getSourceFile()
    const funcDecl = getSimpleTargetNode(sourceFile, positionOrRangeToNumber(arg.positionOrRange), this.selectedAction.args.name, this.options.log)
    if (!funcDecl) {
      this.options.log(`reorderParamsPlugin apply aborted because function ${this.selectedAction.args.name} cannot be found at ${arg.positionOrRange}`)
      return
    }
    // this.options.log(`reorderParamsPlugin apply ${funcDecl && funcDecl.getKindName()} [${this.selectedAction.args && this.selectedAction.args.reorder && this.selectedAction.args.reorder.join(', ')}] ${funcDecl && funcDecl.getText()}`)
    reorderParameters(funcDecl, this.selectedAction.args.reorder, this.options.log);
    sourceFile.saveSync()
    // try {
    //   this.options.info.project.projectService.closeClientFile(arg.sourceFile.fileName)
    //   arg.sourceFile.update(sourceFile.getFullText(), {newLength: sourceFile.getFullText().length,  span: {length:   arg.sourceFile.getFullText().length, start: 0}})
    // }catch(ex){
    //   this.options.log(`reorderParamsPlugin apply ex1: ${ex} ${ex.stack}`)
    // }
  }

  predicate(arg: CodeFixOptions): boolean {
    return true
  }

  getCompletionsAtPosition(fileName: string, position: number, options: ts.GetCompletionsAtPositionOptions): ts.CompletionEntry[] {
    return this.getTextUITool().getCompletionsAtPosition(fileName, position, options)
  }

  getApplicableRefactors(info: ts_module.server.PluginCreateInfo, refactorName: string, refactorActionName: string, fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts_module.UserPreferences): {
    refactors: ts.ApplicableRefactorInfo[];
    selectedAction?: Action;
  } {
    const applicableRefactors = this.getTextUITool().getApplicableRefactors(info, refactorName, refactorActionName, fileName, positionOrRange, userPreferences)
    this.selectedAction = applicableRefactors.selectedAction
    return applicableRefactors
  }

  private getTextUITool(): Tool {
    if (!this.interactionTool) {
      this.interactionTool = create(this.getTextUIToolConfig())
    }
    return this.interactionTool
  }

  private getTargetNode(fileName: string, position: number) {
    const sourceFile = this.options.info.languageService.getProgram().getSourceFile(fileName)
    const target = findChildContainingRangeLight(sourceFile, positionOrRangeToRange(position));
    const predicate = p => ts.isCallSignatureDeclaration(p) || ts.isFunctionLike(p) || ts.isCallOrNewExpression(p) || ts.isMethodSignature(p) || ts.isConstructSignatureDeclaration(p)
    this.options.log('getTargetNode  concat(getAscendants, ' + [target].concat(getAscendants(target)).map(t => getKindName(t) + ' - ' + predicate(t)).join(', '))
    return findAscendant(target, predicate, true)
  }

  private getTextUIToolConfig(): ToolConfig {
    return {
      prefix: '&%&%',
      log: this.options.log,
      actions: [
        {
          name: 'reorderParams',
          args: ['name', 'reorder'],
          commentType: 'block',
          print: action => `Reorder parameters of "${action.args.name}"`,

          snippet: (fileName: string, position: number): string | undefined => {
            let func = this.getTargetNode(fileName, position)
            if (!func) {
              return
            }
            let reorder = []
            let name
            if (ts.isFunctionLike(func)) {
              if (!func || func.parameters && func.parameters.length <= 1) {
                return
              }
              name = func.name ? func.name.getText() : (func.parent && (func.parent as any).name && (func.parent as any).name) ? (func.parent as any).name.getText() : undefined

              if (!name) {
                return
              }
              for (let i = 0; i < func.parameters.length; i++) {
                reorder.push(func.parameters.length - i - 1)
              }
            }
            else if (ts.isCallExpression(func)) {
              if (!func || func.arguments && func.arguments.length <= 1) {
                return
              }
              if (!ts.isIdentifier(func.expression)) {
                return
              }
              name = func.expression.getText()
              for (let i = 0; i < func.arguments.length; i++) {
                reorder.push(func.arguments.length - i - 1)
              }
            }
            //TODO: isCallNew and others that comply with : ts.isCallSignatureDeclaration(p)||ts.isFunctionLike(p)||ts.isCallOrNewExpression(p
            else {
              this.options.log('snippet undefined because not isCallExpression and not isFunctionLike' + func.getText() + ' - ' + getKindName(func))
              return
            }
            const help = this.config.helpComment ? `
    
            /* Help: The second argument is the new order of parameters. Number N in index M means move the M-th 
                argument to index N. Examples: 
             * [1] means switch between first and second
             * [3, 2] means move the first parameter to fourth position and move the second parameter to the third. 
             *   (the rest of the parameters, (third and fourth) will move left to accommodate this requirements) */` : ''
            return `reorderParams("${name}", [${reorder.join(', ')}])${help}`
          },

          // TODO: we could give a more intuitive text-based API by letting the user provide the new signature. Then we create a new function with that signature in order to parse it correctly. 
          nameExtra: (fileName: string, position: number) => {
            const func = this.getTargetNode(fileName, position)
            if (func && ts.isFunctionLike(func)) {
              const name = func.name ? func.name.getText() : (func.parent && (func.parent as any).name && (func.parent as any).name) ? (func.parent as any).name.getText() : ''
              return `of ${name}`
            }
            else if (ts.isCallExpression(func)) {
              return `of ${func.expression ? func.expression.getText() : ''}`
            }
            else {
              return ''
            }
          }
        }
      ]
    }
  }
}

export function getSimpleTargetNode(file: SourceFile, position: number, name: string, log: (msg: string) => void): SignaturedDeclaration & NamedNode & Node | undefined {
  let expr = file.getDescendantAtPos(position)
  if (!expr) {
    return
  }
  const predicate = e => (TypeGuards.isSignaturedDeclaration(e) || TypeGuards.isPropertySignature(e) || TypeGuards.isFunctionLikeDeclaration(e)) && (TypeGuards.isNamedNode(e) || TypeGuards.isNameableNode(e) || TypeGuards.isPropertyNamedNode(e)) && e.getName() === name
  // log('getFunctionSimple: '+expr.getKindName() + ' - ' + expr.getText() + ' - ' + expr.getAncestors().map(e=>e.getKindName() + ' - predicate: ' + predicate(e) + ' - pred1: ' + (TypeGuards.isSignaturedDeclaration(e) || TypeGuards.isPropertySignature(e) || TypeGuards.isFunctionLikeDeclaration(e)) + ' - pred2 : ' + (TypeGuards.isNamedNode(e) || TypeGuards.isNameableNode(e) || TypeGuards.isPropertyNamedNode(e))).join(', '));
  const e = [expr].concat(expr.getAncestors()).find(predicate)
  if (!e) {
    return
  }
  // if (TypeGuards.isSignaturedDeclaration(e) && TypeGuards.isNamedNode(e)) {
  return e as any
  // }
}