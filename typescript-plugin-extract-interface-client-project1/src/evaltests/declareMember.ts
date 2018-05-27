
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true)
interface Hello {
}
const hello: Hello = {}
let i: string[]
i = hello.world([[1, 2, 3], [4, 5]])
const k = hello.mama(1, 2, 3) + ' how are you?'
function(h: Hello) {
  h.fromFunc = true
}
var x: Date = new Date(hello.timeWhen('born'))
class C {
  hello: Hello
  m(s: number[]) { this.hello.grasp(s, [false, true]) }
}
const notDefined:C
const a = notDefined.foof + 9


import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;

function evaluateMe() {
  const Project = c.tsa.Project, print = c.print, ts = c.ts, tsa = c.tsa, TypeGuards = c.tsa.TypeGuards, getKindName = c.util.getKindName, findAscendant = c.util.findAscendant
  const position = 445
  const project = new c.SimpleProjectConstructor();
  const sourceFile = project.createSourceFile('created.ts', `
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true)
interface Hello {
}
const hello: Hello = {}
let i: string[]
i = hello.world([[1, 2, 3], [4, 5]])
const k = hello.mama(1, 2, 3) + ' how are you?'
function(h: Hello) {
  h.fromFunc = true
}
var x: Date = new Date(hello.timeWhen('born'))
class C {
  hello: Hello
  m(s: number[]) { this.hello.grasp(s, [false, true]) }
}
const notDefined:C
const a = notDefined.foof + 9
`)
  const node = sourceFile.getDescendantAtPos(position)
  const typeChecker = project.getTypeChecker()
  const newMemberName_ = node.getText()
  const accessExpr = node.getParent()
  if (!TypeGuards.isPropertyAccessExpression(accessExpr)) {
    return print(`WARNING !TypeGuards.isPropertyAccessExpression(accessExpr) ${accessExpr.getKindName()}`)
  }
  const expressionWithTheType = accessExpr.getParent().getKind() === ts.SyntaxKind.CallExpression ?
    accessExpr.getParent().getParent() : accessExpr.getParent()
  const newMemberType_ = typeChecker.getTypeAtLocation(expressionWithTheType).getBaseTypeOfLiteralType()
  // now we extract arguments in case is a method call, example: const k = hello.mama(1,2,3)+' how are you?'-.
  let args_
  const callExpression = accessExpr.getParent()
  if (TypeGuards.isCallExpression(callExpression)) {
    let argCounter = 0
    args_ = callExpression.getArguments().map(a => ({ name: `arg${argCounter++}`, type: typeChecker.getTypeAtLocation(a).getBaseTypeOfLiteralType() }))
  }
  // now we need to get the target declaration and add the member. It could be an object literal decl{}, an interface decl or a class decl
  const fixTargetDecl = (targetNode, newMemberName, newMemberType, args) => {
    let decls
    if (targetNode.getExpression) {
      decls = targetNode.getExpression().getSymbol().getDeclarations()
    } else if (targetNode && targetNode.getKindName().endsWith('Declaration')) {
      decls = [targetNode]
    } else {
      return print(`WARNING cannot recognized targetNode : ${targetNode && targetNode.getKindName()} ${targetNode && targetNode.getText()}`)
    }
    decls.forEach(d => {
      if (TypeGuards.isVariableDeclaration(d)) {
        // TODO: if there is a clear interface or class that this variable implements and is in this file the we fix there and not here
        
        const targetInit = d.getInitializer()
        const typeDeclInThisFile = (d.getType() && d.getType().getSymbol() && d.getType().getSymbol().getDeclarations() && d.getType().getSymbol().getDeclarations()).find(dd => (TypeGuards.isInterfaceDeclaration(dd) || TypeGuards.isClassDeclaration(dd)) && dd.getSourceFile() === d.getSourceFile())
        if (typeDeclInThisFile) {
          // return print('sshshhssh'+JSON.stringify({newMemberName, newMemberType: newMemberType.getText(), args: args&&args.length}))
          fixTargetDecl(typeDeclInThisFile, newMemberName, newMemberType, args) // recurse - the new member will be added to that decl if any
        } 
        else if (!TypeGuards.isObjectLiteralExpression(targetInit)) {
          //TODO - unknown situation - we should print in the file for discover new cases.
          print(`WARNING  !TypeGuards.isObjectLiteralExpression(targetInit) targetInit.getKindName() === ${targetInit && targetInit.getKindName()} targetInit.getText() === ${targetInit && targetInit.getText()}  d.getKindName() === ${d && d.getKindName()} d.getText() === ${d && d.getText()}`)
        }
        else if (!args) {
          targetInit.addPropertyAssignment({ name: newMemberName, initializer: 'null' })
        }
        else {
          targetInit.addMethod({
            name: newMemberName,
            returnType: newMemberType.getText(),
            bodyText: `throw new Error('Not Implemented')`,
            parameters: args.map(a => ({ name: a.name, type: a.type.getText() }))
          })
        }
      } else if (TypeGuards.isInterfaceDeclaration(d)) {
        if (!args) {
          d.addProperty({ name: newMemberName, type: newMemberType.getText() })
        } else {
          d.addMethod(
            {
              name: newMemberName,
              returnType: newMemberType.getText(),
              parameters: args.map(a => ({
                name: a.name,
                type: a.type.getText()
              }))
            })
        }
      } else if (TypeGuards.isClassDeclaration(d)) {
        if (!args) {
          d.addProperty({ name: newMemberName, type: newMemberType.getText() })
        } else {
          d.addMethod(
            {
              name: newMemberName,
              returnType: newMemberType.getText(),
              parameters: args.map(a => ({
                name: a.name,
                type: a.type.getText()
              }))
            })
        }
      }
      else if (TypeGuards.isParameterDeclaration(d) || TypeGuards.isPropertyDeclaration(d)) {
        // we are referencing a parameter or a property - not a variable - so we need to go to the declaration's declaration
        d.getType().getSymbol().getDeclarations().map(dd => {
          fixTargetDecl(dd, newMemberName, newMemberType, args) // recursive!
        })
      }
      else {
        print(`WARNING: is another thing isParameterDeclaration ${d.getKindName()}`)
      }
    })
  }

  fixTargetDecl(accessExpr, newMemberName_, newMemberType_, args_)
  print(sourceFile.getText())

}
var __output = `
Output:
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true)
interface Hello {
}
const hello: Hello = {}
let i: string[]
i = hello.world([[1, 2, 3], [4, 5]])
const k = hello.mama(1, 2, 3) + ' how are you?'
function(h: Hello) {
  h.fromFunc = true
}
var x: Date = new Date(hello.timeWhen('born'))
class C {
  hello: Hello
  m(s: number[]) { this.hello.grasp(s, [false, true]) }

    foof: any;
}
const notDefined:C
const a = notDefined.foof + 9


`
var __output = `
Output:
sshshhssh{"newMemberName":"notDefined","newMemberType":"any"}
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true)
interface Hello {
}
const hello: Hello = {}
let i: string[]
i = hello.world([[1, 2, 3], [4, 5]])
const k = hello.mama(1, 2, 3) + ' how are you?'
function(h: Hello) {
  h.fromFunc = true
}
var x: Date = new Date(hello.timeWhen('born'))
class C {
  hello: Hello
  m(s: number[]) { this.hello.grasp(s, [false, true]) }
}
const notDefined:C
const a = notDefined.foof + 9


`
var __output = `
Error: (in)
TypeError: Converting circular structure to JSON
Stack:
 TypeError: Converting circular structure to JSON
    at JSON.stringify (<anonymous>)
    at decls.forEach.d (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:65:29)
    at Array.forEach (native)
    at fixTargetDecl (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:58:11)
    at eval (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:124:3)
    at eval (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:128:3)
    at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9)
    at evalCodeAndPrintResult (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:130:20)
    at Object.executeEvalCode (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:96:22)
    at evalCode (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/index.js:76:20)
    at Object.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/index.js:53:16)
    at Object.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-proactive-code-fixes/dist/src/index.js:60:44)
    at IOSession.Session.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:91954:59)
    at Session.handlers.ts.createMapFromTemplate._a.(anonymous function) (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:90877:61)
    at /home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92160:88
    at IOSession.Session.executeWithRequestId (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92151:28)
    at IOSession.Session.executeCommand (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92160:33)
    at IOSession.Session.onMessage (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92180:35)
    at Interface.<anonymous> (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:93377:27)
    at emitOne (events.js:96:13)
    at Interface.emit (events.js:191:7)
    at Interface._onLine (readline.js:241:10)
    at Interface._normalWrite (readline.js:384:12)
    at Socket.ondata (readline.js:101:10)
    at emitOne (events.js:96:13)
    at Socket.emit (events.js:191:7)
    at readableAddChunk (_stream_readable.js:178:18)
    at Socket.Readable.push (_stream_readable.js:136:10)
    at Pipe.onread (net.js:560:20)
Output:


`
var __output = `
Error: (in)
TypeError: Converting circular structure to JSON
Stack:
 TypeError: Converting circular structure to JSON
    at JSON.stringify (<anonymous>)
    at decls.forEach.d (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:65:29)
    at Array.forEach (native)
    at fixTargetDecl (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:58:11)
    at eval (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:124:3)
    at eval (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:128:3)
    at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9)
    at evalCodeAndPrintResult (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:130:20)
    at Object.executeEvalCode (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:96:22)
    at evalCode (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/index.js:76:20)
    at Object.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/index.js:53:16)
    at Object.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-proactive-code-fixes/dist/src/index.js:60:44)
    at IOSession.Session.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:91954:59)
    at Session.handlers.ts.createMapFromTemplate._a.(anonymous function) (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:90877:61)
    at /home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92160:88
    at IOSession.Session.executeWithRequestId (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92151:28)
    at IOSession.Session.executeCommand (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92160:33)
    at IOSession.Session.onMessage (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92180:35)
    at Interface.<anonymous> (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:93377:27)
    at emitOne (events.js:96:13)
    at Interface.emit (events.js:191:7)
    at Interface._onLine (readline.js:241:10)
    at Interface._normalWrite (readline.js:384:12)
    at Socket.ondata (readline.js:101:10)
    at emitOne (events.js:96:13)
    at Socket.emit (events.js:191:7)
    at readableAddChunk (_stream_readable.js:178:18)
    at Socket.Readable.push (_stream_readable.js:136:10)
    at Pipe.onread (net.js:560:20)
Output:


`
var __output = `
Output:
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true)
interface Hello {
}
const hello: Hello = {}
let i: string[]
i = hello.world([[1, 2, 3], [4, 5]])
const k = hello.mama(1, 2, 3) + ' how are you?'
function(h: Hello) {
  h.fromFunc = true
}
var x: Date = new Date(hello.timeWhen('born'))
class C {
  hello: Hello
  m(s: number[]) { this.hello.grasp(s, [false, true]) }

    screw(arg0: Date[]): any {
    }
}
const notDefined:C
notDefined.screw([new Date()])


`
var __output = `
Output:
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true)
interface Hello {
}
const hello: Hello = {}
let i: string[]
i = hello.world([[1, 2, 3], [4, 5]])
const k = hello.mama(1, 2, 3) + ' how are you?'
function(h: Hello) {
  h.fromFunc = true
}
var x: Date = new Date(hello.timeWhen('born'))
class C {
  hello: Hello
  m(s: number[]) { this.hello.grasp(s, [false, true]) }

    screw(arg0: Date[]): any {
    }
}
const notDefined:C
notDefined.screw = 1


`
var __output = `
Output:
WARNING !TypeGuards.isPropertyAccessExpression(accessExpr) ArrayLiteralExpression

`
