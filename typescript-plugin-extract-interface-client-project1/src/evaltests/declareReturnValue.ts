
function f(): boolean {	//"code": "2355",	"message": "A function whose declared type is neither 'void' nor 'any' must return a value.",
}
function g(): GResult {	//"code": "2304",	"message": "Cannot find name 'GResult'.",
  return { a: 1, b: 's' }
}
const h = () => HResult{
  return { a: 1, b: 's', log: (msg) => boolean, kill: function() { return 1 }}
}
function fn<T>(): FNResult<T> {
  return { a: 1, b: 's', log: (msg:string) =>{return Math.random()>0.1?true:'foo'}, kill: function <T>() { return 1 } }
} 
 

import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;

function evaluateMe() {

  const Project = c.tsa.Project, print = c.print, ts = c.ts, TypeGuards = c.tsa.TypeGuards, getKindName = c.util.getKindName, findAscendant = c.util.findAscendant

  const position = 378
  const project = new c.SimpleProjectConstructor();
  const sourceFile = project.createSourceFile('created.ts', `
function f(): boolean {	//"code": "2355",	"message": "A function whose declared type is neither 'void' nor 'any' must return a value.",
}
function g(): GResult {	//"code": "2304",	"message": "Cannot find name 'GResult'.",
  return { a: 1, b: 's' }
}
const h = () => HResult{
  return { a: 1, b: 's', log: (msg) => boolean, kill: function() { return 1 }}
}
function fn<T>(): FNResult<T> {
  return { a: 1, b: 's', log: (msg:string) {return Math.random()>0.1?true:'foo'}, kill: function <T>() { return 1 } }
}
`)
  const currentPosDiag = sourceFile.getPreEmitDiagnostics().find(d => d.getCode() == 2304 && d.getStart() <= position && d.getStart() + d.getLength() >= position)
  const node = sourceFile.getDescendantAtPos(position)

  const inferReturnType = (decl) => {
    const tmpSourceFile = project.createSourceFile('tmp2.ts', decl.getText() + '; const tmp = ' + decl.getName() + '()')
    const tmpDecl = tmpSourceFile.getDescendantsOfKind(ts.SyntaxKind.FunctionDeclaration)[0]
    const typeargs = tmpDecl.getReturnType().getTypeArguments()
    tmpDecl.removeReturnType()
    const tmp = tmpSourceFile.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration)
    const type = project.getTypeChecker().getTypeAtLocation(tmp)
    print('tp: '+tmp.getText() + 'ssss+***'+type.getText())
    const intStructure = {
      name: decl.getReturnTypeNode().getText(),
      properties: type.getProperties()
        .filter(p => { const v = p.getValueDeclaration(); return TypeGuards.isPropertyAssignment(v) && !v.getInitializer().getKindName().includes('Function') })
        .map(p => ({
          name: p.getName(),
          type: project.getTypeChecker().getTypeAtLocation(p.getValueDeclaration()).getText(),
          val: p.getValueDeclaration()
        })),
      methods: type.getProperties()
        .filter(p => { 
          const v = p.getValueDeclaration(); 
          return TypeGuards.isPropertyAssignment(v) && v.getInitializer().getKindName().includes('Function') 
        })
        .map(p => {
          const v = p.getValueDeclaration()
          if (!TypeGuards.isPropertyAssignment(v)) { 
            return [] 
          }
          const init = v.getInitializer()
          if (!TypeGuards.isArrowFunction(init) && !TypeGuards.isFunctionExpression(init)) { 
            return [] 
          }          
          return {
            name: p.getName(),
            returnType: init.getReturnType() ? init.getReturnType().getText():  'any',
            parameters: init.getParameters().map(pa => ({
              name: pa.getName(), 
              type: pa.getType().getText() 
            }))
          }
        }),
      typeParameters: typeargs.map(ta => ({ 
        name: ta.getSymbol().getName() 
      })),
    }
    tmpSourceFile.delete()
    return intStructure
  }
  const decl = node.getFirstAncestorByKind(ts.SyntaxKind.FunctionDeclaration)

  const intStruct = inferReturnType(decl)
  sourceFile.addInterface(intStruct)
  print(sourceFile.getText())

}
