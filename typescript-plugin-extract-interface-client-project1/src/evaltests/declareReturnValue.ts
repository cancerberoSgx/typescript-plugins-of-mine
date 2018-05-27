
function f(): boolean {	//"code": "2355",	"message": "A function whose declared type is neither 'void' nor 'any' must return a value.",
}
function g(): GResult {	//"code": "2304",	"message": "Cannot find name 'GResult'.",
  return { a: 1, b: 's' }
}
const h = () => HResult{
  return { a: 1, b: 's', log: (msg) => boolean, kill: function() { return 1 }}
}
function fn<T>(): FNResult<T> {
  return { a: 1, b: 's', log: (msg) => boolean, kill: function <T>() { return 1 } }
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
  return { a: 1, b: 's', log: (msg) => boolean, kill: function <T>() { return 1 } }
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
    const type = project.getTypeChecker().getTypeAtLocation(tmp)//.getApparentProperties().map(p=>p.getName()).join(',')//.getText()
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
        .filter(p => { const v = p.getValueDeclaration(); return TypeGuards.isPropertyAssignment(v) && v.getInitializer().getKindName().includes('Function') })
        .map(p => ({
          name: p.getName(),
          returnType: project.getTypeChecker().getTypeAtLocation(p.getValueDeclaration()).getText(),
          parameters: ((p) => {
            const v = p.getValueDeclaration();
            if (!TypeGuards.isPropertyAssignment(v)) { return [] };
            const init = v.getInitializer();
            if (!TypeGuards.isFunctionLikeDeclaration(init)) { return [] };
            return init.getParameters().map(pa => ({ name: pa.getName(), type: pa.getType().getText() }))
          })(p)
        })),
      typeParameters: typeargs.map(ta => ({ name: ta.getSymbol().getName() })),
    }
    // tmpSourceFile.addInterface({
    //   name: 'sjs',
    //   methods: [{ name: 'sjs', returnType: ' ', typeParameters: [{ name: 'T' }], parameters: [{ name: 's', type: 'string', hasQuestionToken: true }] }],
    //   typeParameters: typeargs.map(ta => ({ name: ta.getSymbol().getName() })),
    // })
    tmpSourceFile.delete()
    return intStructure
  }
  const decl = node.getFirstAncestorByKind(ts.SyntaxKind.FunctionDeclaration)

  const intStruct = inferReturnType(decl)
  sourceFile.addInterface(intStruct)
  print(sourceFile.getText())

}

/***@


  const program = c.info.languageService.getProgram()
  const position = c.util.positionOrRangeToNumber(c.positionOrRange)
  const sourceFile = c.node.getSourceFile()
  const containingTarget = c.util.findChildContainingRange(sourceFile,c.util.positionOrRangeToRange(position))
  const containedTarget = c.util.findChildContainedRange(sourceFile,c.util.positionOrRangeToRange(position))
  c.print(position+ ' - '+c.util.getKindName(containingTarget) + ' - '+c.util.getKindName(containedTarget))

@***/




  // if(!TypeGuards.isFunctionDeclaration(decl)){
  //   print(`exiting: ${TypeGuards.isFunctionDeclaration(decl)}`)
  //   return
  // }

  // project.getTypeChecker().getApparentType(decl.getReturnType())
  // decl.getReturnType()
  // if(!TypeGuards.isIdentifier(node)){
  //   return print('exiting not identifier')
  // }
  // node.getDefinitionNodes().map(d=>d.getText())

  // print(`${node.getKindName()} - ${node.getText()} - ${project.getTypeChecker().getApparentType(decl.getReturnType()).getText()}`)
  // const tmpSourceFile = project.createSourceFile('tmp2.ts',  decl.getText()+'; const tmp = '+decl.getName()+'()')
  // const tmpDecl = tmpSourceFile.getDescendantsOfKind(ts.SyntaxKind.FunctionDeclaration)[0]
  // tmpDecl.removeReturnType()
  // const tmp = tmpSourceFile.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration)
  // print(tmp.getKindName() +' - '+project.getTypeChecker().getTypeAtLocation(tmp).getText() + '**** - '+tmpSourceFile.getText())
  // tmpSourceFile.delete()




  // const program2 = c.info.languageService.getProgram()
  // const sourceFile2 =program2.getSourceFile(c.fileName)
  // program2.getDeclarationDiagnostics().map(d=>d.messageText).join(', ')
  // print( 'mss: '+program2.getSemanticDiagnostics().filter(d=>d.file===sourceFile2).map(d=>d.messageText).join(', '))
  // const containingTarget = c.util.findChildContainingRange(sourceFile2,c.util.positionOrRangeToRange(position))

  // const predicate2355 = (program2, sourceFile2,containingTarget)=>{
  //   const diagCorrect = program2.getSemanticDiagnostics().filter(d=>d.file===sourceFile2 && d.code===2304 && d.start<= containingTarget.getStart()&& d.start+d.length>=containingTarget.getEnd())
  //   // const nodeCorrect = containingTarget.kind==ts.SyntaxKind.TypeReference|| containingTarget.kind==ts.SyntaxKind.FunctionDeclaration || findAscendant(containingTarget, t=> t.kind==ts.SyntaxKind.TypeReference|| t.kind==ts.SyntaxKind.FunctionDeclaration)
  //   return !!diagCorrect//&& !!nodeCorrect
  // }
  // print('predicate2355: '+predicate2355(program2, sourceFile2, containingTarget))
  // const containedTarget = c.util.findChildContainedRange(sourceFile2,c.util.positionOrRangeToRange(position))
  // print(`${getKindName(containingTarget)} - ${containingTarget.getText()} -${getKindName(containingTarget.parent)} ${getKindName(containingTarget.parent.parent)}`)etKindName(containingTarget.parent)} ${getKindName(containingTarget.parent.parent)}`)
