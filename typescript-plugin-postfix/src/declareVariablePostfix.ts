import * as ts from 'typescript';
import { findAscendant, findChild, getKindName } from "typescript-ast-util";
import { Postfix, PostfixConfig, PostfixExecuteOptions, PostfixPredicateOptions } from "./types";

export class DeclareVariablePostfixConfig implements PostfixConfig {
  constructor(name: string, type: 'const' | 'let' | 'var') {
    this.name = name
    this.type = type
  }
  name: string
  kind: ts.ScriptElementKind = ts.ScriptElementKind.unknown
  kindModifiers: string
  sortText: string
  insertText?: string
  replacementSpan?: ts.TextSpan
  hasAction?: true
  source?: string
  isRecommended?: true
  type: 'const' | 'let' | 'var'
}

const isExpression = node => getKindName(node).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier || getKindName(node).endsWith('Literal')
const isNotExpression = node => !isExpression(node)
const isBlock = node => getKindName(node).endsWith('Block') || node.kind === ts.SyntaxKind.SourceFile
const isStatement = node => getKindName(node).endsWith('Statement')

export class DeclareVariablePostFix implements Postfix {
  target: ts.Node
  name: 'Variable Declaration'
  description: 'Adds a variable declaration when user start typing `.const`, `.let` or `var`'

  constructor(public config: DeclareVariablePostfixConfig) { 
    this.counter=0
  }

  predicate(opts: PostfixPredicateOptions): boolean {
    return true
  }

  private counter:number
  execute(opts: PostfixExecuteOptions): string {
    let { program, fileName, position, target, log } = opts

    const sourceFile = program.getSourceFile(fileName)
    // if(!ts.isPropertyAccessExpression(target)){
      target = findAscendant(target, ts.isPropertyAccessExpression,true)
      if(!target){
        opts.log('declareVariable postfix doing nothing because !findAscendant(target, ts.isPropertyAccessExpression,true)'+ getKindName(opts.target))
        return //'TODO1\n'
      }
    // }

    // // the target expression that will be declared as variable. 
    const targetExpression = findChild(findAscendant(target, isNotExpression), isExpression, false)
    // const statementContainer = findAscendant(targetExpression, isBlock)
    const declarationNextSibling = findAscendant(targetExpression, n=> !n.parent || isBlock(n.parent) && isStatement(n), true)


    
    // //Following commented code is also an implementation without transforms and printer that doesn't reformat the code but has some issues though...
    // // poor man indentation detector
    if(!ts.isPropertyAccessExpression(target)){
      opts.log('declareVariable postfix doing nothing because !ts.isPropertyAccessExpression(target)'+ getKindName(opts.target))
      return //'TODO2\n'
    }
    const siblingIndentationMatch = /^(\s*)/m.exec(declarationNextSibling.getFullText())
    const siblingIndentation = siblingIndentationMatch ? siblingIndentationMatch[1] : ''
    let allText = sourceFile.getFullText()
    // Let's remove ".let" from the target expression:
    const targetExpressionTextWithoutNode =
      allText.substring(targetExpression.pos, target.expression.end) //+  // -1 to remove the prefixed dot 
      // allText.substring(target.name.end, targetExpression.end)

      const left =targetExpression// (targetExpression as ts.BinaryExpression).left||targetExpression
    const allNewText = allText.substring(0, declarationNextSibling.pos) +  
      // the following lines add our dummy variable declaration instead of the targetlocation
      siblingIndentation + 'const renameIt = ' + targetExpressionTextWithoutNode + ';' + 
      allText.substring(declarationNextSibling.pos , targetExpression.pos) +  
      ' renameIt ' +//+left.getText()+'-'+getKindName(left) +' - '+
      allText.substring( left.end, sourceFile.end) + 
      // 'seba\n'
      ''

    // opts.log('RETURNIG TEXT: '+allNewText)
    return allNewText 




    // // The following is implementation based on typescript transformations: 

    // // this transformation will remove the postfix ".let" from the expression
    // const removePostfix = (context) => {
    //   return (rootNode) => {
    //     const visit = (node: ts.Node) => {
    //       node = ts.visitEachChild(node, visit, context)
    //       if (node === target) {
    //         return ts.getMutableClone(target.expression)
    //       }
    //       return node
    //     }
    //     return ts.visitNode(rootNode, visit)
    //   }
    // }
    // // this transformation will add the variable declaration as the first child of the black
    // const addVariableDeclaration = (context) => {
    //   return (rootNode) => {
    //     const visit = node => {
    //       node = ts.visitEachChild(node, visit, context)
    //       if (node === statementContainer) {
    //         const targetExpressionType = program.getTypeChecker().getTypeAtLocation(targetExpression)
    //         const typeNode = program.getTypeChecker().typeToTypeNode(targetExpressionType)
    //         const targetExpressionClone = ts.getMutableClone(targetExpression) as ts.Expression
    //         const variableDeclaration = ts.createVariableDeclaration(this.variableName(), typeNode, targetExpressionClone)
    //         const variableDeclarationList = ts.createVariableDeclarationList([variableDeclaration], this.getVariableFlag())
    //         return ts.updateBlock(node, [variableDeclarationList as any].concat(node.statements))
    //       }
    //       return node 
    //     }
    //     return ts.visitNode(rootNode, visit)
    //   }
    // }
    // // this transformation will replace the original expression with the new variable name added by  addVariableDeclaration
    // const replaceExpressionWithVariable = (context) => {
    //   return (rootNode) => {
    //     const visit = node => {
    //       node = ts.visitEachChild(node, visit, context)
    //       if (node === targetExpression) {
    //         return ts.createIdentifier(this.variableName())
    //       }
    //       return node
    //     }
    //     return ts.visitNode(rootNode, visit)
    //   }
    // }
    // const transformations = [addVariableDeclaration, replaceExpressionWithVariable, removePostfix]
    // const result = ts.transform(sourceFile, transformations, opts.program.getCompilerOptions())
    // const printer = ts.createPrinter()
    // const transformedSourceFile = result.transformed[0]
    // const output = printer.printFile(transformedSourceFile)
    // return output
  }

  variableName(): string {
    return 'nameMePlease'
  }

  getVariableFlag() {
    if (this.config.type === 'const') {
      return ts.NodeFlags.Const
    } if (this.config.type === 'let') {
      return ts.NodeFlags.Let
    } else {
      return ts.NodeFlags.None
    }
  }
}
