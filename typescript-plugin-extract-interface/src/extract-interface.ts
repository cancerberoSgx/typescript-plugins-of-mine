import * as ts from 'typescript/lib/tsserverlibrary';
// import { ScriptTarget } from 'typescript/lib/tsserverlibrary';

function printNode(signature: ts.TypeElement, originalNode: ts.ClassElement): string {
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  },
    {
      substituteNode(hint, node) { // TODO: don't know why I need to do this . if I dont the pinter won t print identifiers
        if (ts.isIdentifier(node)) {
          return ts.createIdentifier(node.escapedText.toString())
        }
        return node
      }
    }
  )

  let jsdocPrefix = ''
  const nodeChildren = originalNode.getChildren()
  if (nodeChildren && nodeChildren.length && nodeChildren[0].kind === ts.SyntaxKind.JSDocComment) {
    jsdocPrefix += nodeChildren[0].getText()
  }
  const result = printer.printNode(ts.EmitHint.Unspecified, signature, ts.createSourceFile('temp.ts', '', ts.ScriptTarget.Latest));

  return jsdocPrefix + '\n' + result
}

export function extractInterface(node: ts.ClassDeclaration): string {
  const members: string[] = []
  const debug: string[] = []
  const excludeMembersWithKeywords = [ts.SyntaxKind.StaticKeyword, ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword]

  let classJsdoc = ''
  const nodeChildren = node.getChildren()
  if (nodeChildren && nodeChildren.length && nodeChildren[0].kind === ts.SyntaxKind.JSDocComment) {
    classJsdoc += nodeChildren[0].getText()
  }
  node.members
    .filter(member => !(member.modifiers && member.modifiers.map(m => m.kind).find(modifier => excludeMembersWithKeywords.includes(modifier))))
    .forEach(member => {
      if (ts.isMethodDeclaration(member)) {
        const method = member as ts.MethodDeclaration
        const methodSignature = ts.createMethodSignature(method.typeParameters, method.parameters, method.type, method.name, method.questionToken)
        members.push(printNode(methodSignature, method))
      }
      if (ts.isPropertyDeclaration(member)) {
        const property = member as ts.PropertyDeclaration
        const propertySignature = ts.createPropertySignature(property.modifiers, property.name, property.questionToken, property.type, property.initializer)
        members.push(printNode(propertySignature, property))
      }
      if (ts.isConstructorDeclaration(member)) {
        const constructor = member as ts.ConstructorDeclaration
        const propertySignature = ts.createConstructSignature(
          constructor.typeParameters,
          constructor.parameters, constructor.type)  // TODO: had to cast dont know how safe
        let printed = printNode(propertySignature, constructor) // not ready yet will be something like this: new (iron: number);
        printed = printed.replace(/new/, 'constructor')
        if (node.name) {
          printed = printed.substring(0, printed.length - 1) + ': ' + node.name.getText()
          if(node.typeParameters){
            printed += ' <' + node.typeParameters.map(tp=>tp.getText()).join(', ') + '>'
          }
        }
        members.push(printed)
      }
    })
  let name = node.name ? 'I' + node.name.escapedText : 'IAnonymousClass'
  if(node.typeParameters){
    name += ' <' + node.typeParameters.map(tp=>tp.getText()).join(', ') + '>'
  }
  return `
${classJsdoc}
export interface ${name} {
${members.join('\n  ')}
}
`
}


/*

Example of WSASYSNOTREADY

export class Vehicle extends Transport {
  engine: {iron:number, gas: Array<string>} = {iron: 3, gas: []}
  public async startEngine(strong: string[]): Promise<boolean>{return false}
  private p1(): boolean{return false}
  static s1(): boolean{return false}
  none(){}
}
` #0 Vehicle ClassDeclaration
 #0  ExportKeyword
 #1  Identifier
 #2  HeritageClause
   #0 Transport ExpressionWithTypeArguments
     #0  Identifier

     
 #3 engine PropertyDeclaration
   #0  Identifier
   #1  TypeLiteral
     #0 iron PropertySignature
       #0  Identifier
       #1  NumberKeyword
     #1 gas PropertySignature
       #0  Identifier
       #1 Array TypeReference
         #0  Identifier
         #1  StringKeyword
   #2  ObjectLiteralExpression
     #0 iron PropertyAssignment
       #0  Identifier
       #1  NumericLiteral
     #1 gas PropertyAssignment
       #0  Identifier
       #1  ArrayLiteralExpression
 #4 startEngine MethodDeclaration
   #0  PublicKeyword
   #1  AsyncKeyword
   #2  Identifier
   #3 strong Parameter
     #0  Identifier
     #1  ArrayType
       #0  StringKeyword
   #4 Promise TypeReference
     #0  Identifier
     #1  BooleanKeyword
   #5  Block
     #0  ReturnStatement
       #0  FalseKeyword
 #5 p1 MethodDeclaration
   #0  PrivateKeyword
   #1  Identifier
   #2  BooleanKeyword
   #3  Block
     #0  ReturnStatement
       #0  FalseKeyword
 #6 s1 MethodDeclaration
   #0  StaticKeyword
   #1  Identifier
   #2  BooleanKeyword
   #3  Block
     #0  ReturnStatement
       #0  FalseKeyword


 #7 none MethodDeclaration
   #0  Identifier
   #1  Block`

   */
// function filterMembers(member: ts.ClassElement)