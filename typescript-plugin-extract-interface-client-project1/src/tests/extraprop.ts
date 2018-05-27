const tree1: Living = {
    name: ''
}
interface Living {
  name: string
  log(msg?:string): Array<Array<Living>>
}
const tree2: Living = {
  name: 'hehehe',
  dddd: 'hshs' //	"code": "2322",	"message": "Type '{ name: string; dddd: string; }' is not assignable to type 'Living'.\n  Object literal may only specify known properties, and 'dddd' does not exist in type 'Living'.",
}

function f(l: Living): number {
  return 1
}

f({})// 	"code": "2345","message": "Argument of type '{}' is not assignable to parameter of type '{ done: (y: number) => void; }'.\n  Property 'done' is missing in type '{}'.",

class Earth {
  livingThings: Living[] = [{}]//"code": "2322",	"message": "Type '{}[]' is not assignable to type 'Living[]'.\n  Type '{}' is not assignable to type 'Living'.\n    Property 'name' is missing in type '
}

import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;

function evaluateMe() {

  const Project = c.tsa.Project, print = c.print, ts = c.ts, TypeGuards = c.tsa.TypeGuards
  const project = new c.SimpleProjectConstructor();
  const sourceFile = project.createSourceFile('created.ts', `
const trs1: Living = { 
  strange: Array<String>
}
interface Living {
  name: string
  size: number[]
  log(msg): Array<Array<Living>>
}
`)

  const position = 8
  const currentPosDiag = sourceFile.getPreEmitDiagnostics().find(d => d.getStart() <= position && d.getStart() + d.getLength() >= position)
  const node = sourceFile.getDescendantAtPos(position)

  const varDecl = TypeGuards.isVariableDeclaration(node) ? node : node.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclaration)
  const init = varDecl.getInitializerIfKind(ts.SyntaxKind.ObjectLiteralExpression)
  const getDefaultValueForType = (t) => { // TODO: this should be recursive in case it references another interface - we can recreate the whole thing recursively... 
    if(!t){
      return 'null'
    } else if (t.getText() === 'string') {
      return '\'\''
    } else if (t.getText() === 'boolean') {
      return 'false'
    } else if (t.getText() === 'number') {
      return '0'
    } else if(t.isArrayType()){
      return '[]'
    } else {
      return 'null'
    }
  }
  varDecl.getType().getSymbol().getDeclarations().forEach(decl => {
    if (TypeGuards.isInterfaceDeclaration(decl)) {

      const toRemove = []
      init.getProperties().forEach(prop=>{
        if(prop.getName&&!decl.getMembers().find(m=>m.getName()===prop.getName())){
            toRemove.push(prop)
        }
      })
      decl.getProperties().forEach(prop => {
        if(!init.getProperty(prop.getName())) {
          init.addPropertyAssignment({ name: prop.getName(), initializer:getDefaultValueForType(prop.getType()) })
        }
      })
      decl.getMethods().forEach(method => {
        if(!init.getProperty(method.getName())) {
          init.addMethod({ name: method.getName(), returnType: method.getReturnType().getText(), bodyText: 'throw new Error(\'Not Implemented\')'})
        }
      })
      

    toRemove.forEach(prop=>{ prop.getSourceFile().removeText(prop.getFullStart(), prop.getNextSibling() && prop.getNextSibling().getKind()===ts.SyntaxKind.CommaToken ? prop.getNextSibling().getEnd() : prop.getEnd())})
  }
  })
  print(`
${sourceFile.getText()}
  `)


}

/***@


  const program = c.info.languageService.getProgram()
  const position = c.util.positionOrRangeToNumber(c.positionOrRange)
  const sourceFile = c.node.getSourceFile()
  const containingTarget = c.util.findChildContainingRange(sourceFile,c.util.positionOrRangeToRange(position))
  const containedTarget = c.util.findChildContainedRange(sourceFile,c.util.positionOrRangeToRange(position))
  c.print(position+ ' - '+c.util.getKindName(containingTarget) + ' - '+c.util.getKindName(containedTarget))

@***/