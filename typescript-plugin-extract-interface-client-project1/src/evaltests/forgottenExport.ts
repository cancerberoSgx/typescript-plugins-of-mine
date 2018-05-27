
interface IA {
  method1(): string
}

class A implements IA {
  prop2: string = 'hello'
  constructor(protected prop1: string) { }

  method1(): string {
    return null;
  }
}

export const forgotttt:IA = new A('')


// import { EvalContext } from 'typescript-plugin-ast-inspector';
// declare const c: EvalContext;

// function evaluateMe() {

//   const Project = c.tsa.Project, print = c.print, ts = c.ts, tsa = c.tsa, TypeGuards = c.tsa.TypeGuards, getKindName = c.util.getKindName, findAscendant = c.util.findAscendant
//   const position = 112
//   const project = new c.SimpleProjectConstructor();
//   const sourceFile = project.createSourceFile('created.ts', `
// function ghghg(t?: boolean[]):string[]|number{
//   console.log('forgot to return')
// }
// const other = (a:string):number=>{
//   var c = a+5
// }
// `)
//   const node = sourceFile.getDescendantAtPos(position)
//   const funcDecl = node.getFirstAncestorByKind(ts.SyntaxKind.FunctionDeclaration)
//   if (funcDecl) {
//     funcDecl.addStatements('return null;')
//   }
//   const arrowDecl = node.getFirstAncestorByKind(ts.SyntaxKind.ArrowFunction)
//   if (arrowDecl) {
//     arrowDecl.addStatements('return null;')
//   }
//   print(`${sourceFile.getText()} `)


// }
