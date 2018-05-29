
interface SomeInterface {
  method1(param: string): Array<number>
}
class SomeImplementation implements SomeInterface {
  method1(param: number): number[] {
    throw new Error("Method not implemented.");
  }
}

// "code": "2416","message": "Property 'method1' in type 'SomeImplementation' is not assignable to the same property in base type 'SomeInterface'.\n  Type '(param: number) => number[]' is not assignable to type '(param: string) => number[]'.\n    Types of parameters 'param' and 'param' are incompatible.\n      Type 'string' is not assignable to type 'number'.",

import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;

function evaluateMe() {
  const Project = c.tsa.Project, print = c.print, ts = c.ts, tsa = c.tsa, TypeGuards = c.tsa.TypeGuards, getKindName = c.util.getKindName, findAscendant = c.util.findAscendant
  const position = 126
  const project = new c.SimpleProjectConstructor();
  const sourceFile = project.createSourceFile('created.ts', `
interface SomeInterface{
  method1(param: string): Array<number>
}
class SomeImplementation implements SomeInterface {
  method1(param: number): number[] {
    throw new Error("Method not implemented.");
  }
}
`)
const node = sourceFile.getDescendantAtPos(position)
const containerMethod =node.getFirstAncestorByKind(ts.SyntaxKind.MethodDeclaration) 
const containerClass = node.getFirstAncestorByKind(ts.SyntaxKind.ClassDeclaration)
containerClass.getImplements()
containerClass.get

if(TypeGuards.isIdentifier(node)){
  node.getDefinitions().forEach(d=>{
    print(d.())
    
  })
}

// print(sourceFile.getClass('SomeImplementation').getMethod('method1').getSymbol().getd.getsu.getImplementation().getText())

function getImplementsAll(classDeclaration){
  const impls = classDeclaration.getImplements()

}
function getExtendsAll(classOrInterfaceDecl){
  // it's impossible to be cycles here right ? 
  classOrInterfaceDecl.getExtends()
}
}
