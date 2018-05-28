
class C1 extends NonExistent implements NonExistentInterface, ExistentInterface {
}
class ExistentInterface {
}
class C2 extends ShowsJsDocIssue implements NonExistentInterface, ExistentInterface {
}



import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;

function evaluateMe() {

  const Project = c.tsa.Project, print = c.print, ts = c.ts, tsa = c.tsa, TypeGuards = c.tsa.TypeGuards, getKindName = c.util.getKindName, findAscendant = c.util.findAscendant

  const position = 26
  const project = new c.SimpleProjectConstructor();
  const sourceFile = project.createSourceFile('created.ts', `
  class C1 extends NonExistent implements NonExistentInterface, ExistentInterface{
  }
  class ExistentInterface{
  }
  class C2 extends ShowsJsDocIssue implements NonExistentInterface, ExistentInterface{
  }
`)
  const id = sourceFile.getDescendantAtPos(position)
  const decl = id.getAncestors().find(a => TypeGuards.isClassDeclaration(a) || TypeGuards.isInterfaceDeclaration(a))

  if (!TypeGuards.isClassDeclaration(decl) && !TypeGuards.isInterfaceDeclaration(decl)) {
    return print(`WARNING ${decl.getKindName()} not a class or interface decl`)
  }
  const isInterface = TypeGuards.isInterfaceDeclaration(decl)
  const code =
    `
${decl.isExported() ? 'export ' : ''}${isInterface ? 'interface' : 'class'} ${id.getText()} {
}
`
  id.getSourceFile().insertText(decl.getStart(), code)
  print(id.getSourceFile().getText())
}



/***@ 

// use this code to get the user's selection position to hardcode in the code above, just select
part of "let" nad activate refactor "eval code in comments"

const program = c.info.languageService.getProgram() 
const position = c.util.positionOrRangeToNumber(c.positionOrRange) 
const n = 
c.print(position)

@***/
