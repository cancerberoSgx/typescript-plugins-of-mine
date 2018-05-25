import { Postfix, PostfixConfig, PostfixPredicateOptions, PostfixExecuteOptions } from "./types";
import * as ts from 'typescript'
import { findChild, getKindName, findAscendant } from "typescript-ast-util";


export class DeclareVariablePostfixConfig implements PostfixConfig {
  constructor(name: string, type: 'const'|'let'|'var'){
    this.type=type
    this.name = name
  }
  name: string
  kind: ts.ScriptElementKind = ts.ScriptElementKind.unknown
  kindModifiers: string;
  sortText: string;
  insertText?: string;
  replacementSpan?: ts.TextSpan;
  hasAction?: true;
  source?: string;
  isRecommended?: true;
  /** declared variable keyword */
  type: 'const'|'let'|'var'
  // /** 
  //  * if zero won't match any thing, 1 means the closest expression. 
  //  * Use a big number like 100 to match the most outer / big expression
  //  */
  // matchExpressionLevel: number  // TODO: now we only match the outer more bigger one.
} 

const isExpression = node => getKindName(node).endsWith('Expression') || 
  node.kind === ts.SyntaxKind.Identifier || 
  getKindName(node).endsWith('Literal')
const isNotExpression = node => !isExpression(node)
const isBlock = node => getKindName(node).endsWith('Block') || node.kind === ts.SyntaxKind.SourceFile
const isStatement = node => getKindName(node).endsWith('Statement')

export class DeclareVariablePostFix implements Postfix {
  target: ts.Node;
  name: 'Variable Declaration'
  description: 'Adds a variable declaration when user start typing `.const`, `.let` or `var`'

  constructor(public config: DeclareVariablePostfixConfig){ }

  completion():string{
    return this.config.type
  }
  predicate(opts: PostfixPredicateOptions): boolean{
    
    return true // default completion trigger with dot is fine for us dont need any customization here
  }

  execute(opts: PostfixExecuteOptions) : string{
    const {program, fileName,  position, target} = opts;
    const sourceFile = program.getSourceFile(fileName)
  
    // Then we want to locate the target expression that will be declared as variable. here we  assume 
    // that the user wants to declare the toper one as variable (targetExpression):
    const targetExpression = findChild(findAscendant(target, isNotExpression), isExpression)
  
    // we first find a node that can contain our variable declaration and its children statement right
    // before which we will add our declaration (the container is a Block so we are sure its children
    // are wrapped has curly braces. Both are the next nodes:
    const statementContainer = findAscendant(targetExpression, isBlock)
    const declarationNextSibling = findChild(statementContainer, isStatement)

    
    // this transformation will remove the postfix ".let" from the expression
    const removePostfix = (context) => {
      return (rootNode) => {
        const visit = node => {
          node = ts.visitEachChild(node, visit, context)
          if ( node.name === target) {
            return node.expression // instead of the expression `expr.let` we return just `expr`
          }
          return node
        }
        return ts.visitNode(rootNode, visit)
      }
    }
  
    // this transformation will add the variable declaration as the first child of the black
    const addVariableDeclaration = (context) => {
      return (rootNode) => {
        const visit = node => {
          node = ts.visitEachChild(node, visit, context)
          if (node === statementContainer) {
            const targetExpressionType = program.getTypeChecker().getTypeAtLocation(targetExpression)
            const typeNode = program.getTypeChecker().typeToTypeNode(targetExpressionType)
            // Heads up ! we need to create a copy of target extension using `ts.getMutableClone`. If we dont do
            // that, `replaceExpressionWithVariable` transformation will replace also this expression with the
            // variable name but we only want to replace the original targetExpression 
            const targetExpressionClone = ts.getMutableClone(targetExpression) as ts.Expression
            const variableDeclaration = ts.createVariableDeclaration(this.variableName(), typeNode, targetExpressionClone) // TODO: name from config
            const variableDeclarationList = ts.createVariableDeclarationList([variableDeclaration], ts.NodeFlags.Const)
            return ts.updateBlock(node, [variableDeclarationList as any].concat(node.statements))
          }
          return node
        }
        return ts.visitNode(rootNode, visit)
      }
    }
    // this transformation will replace the original expression with the new variable name added by  addVariableDeclaration
    const replaceExpressionWithVariable = (context) => {
      return (rootNode) => {
        const visit = node => {
          node = ts.visitEachChild(node, visit, context)
          if (node === targetExpression) { 
            return ts.createIdentifier(this.variableName())
          }
          return node
        }
        return ts.visitNode(rootNode, visit)
      }
    }
  
    // HEADS UP! the order is important! transformations will be applied serially and affect each other. 
    // In general the less destructive / top level first
    const transformations = [addVariableDeclaration, replaceExpressionWithVariable,  removePostfix, ]
    const result = ts.transform(sourceFile,  transformations)
    const printer = ts.createPrinter()
    const transformedSourceFile = result.transformed[0]
    const output = printer.printFile(transformedSourceFile)
    return output
  }
  
  variableName(): string { 
    return 'nameMePlease'
  }
}



// const isExpression = node => getKindName(node).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier || 
// getKindName(node).endsWith('Literal')
// const isNotExpression = node => !isExpression(node)
// const isBlock = node => getKindName(node).endsWith('Block') || node.kind === ts.SyntaxKind.SourceFile
// const isStatement = node => getKindName(node).endsWith('Statement')


// function execute 


// export class IfPostfix extends AbstractPostfix {

// }
// export abstract class AbstractPostfix implements Postfix {
//   name: string;
//   description: string;
//   completion: string;
//   config: AbstractPostfixConfig
//   abstract predicate(arg: PostfixPredicateArg): boolean
//   abstract subExpressionPredicate(fileName: string, position: number): ts.Node
//   abstract execute(expression: ts.Node, fileName: string, position: number)
//   abstract variableName(expr: ts.Node): string
// }