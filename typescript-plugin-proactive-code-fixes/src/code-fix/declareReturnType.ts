
import { fromNow, now, timeFrom } from 'hrtime-now';
// import * as tsa from 'ts-morph';
import { InterfaceDeclarationStructure, TypeGuards, ts, Node, SignaturedDeclaration } from 'ts-morph';
// import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { buildRefactorEditInfo } from '../util';
/** 

# Description

declare type for return value but no interface or class declaration is present for that - we create a new interface from return value 

# Attacks

"code": "2304",	"message": "Cannot find name 'GResult'.",

# Example, 

declare a function like the following - return type is not declared. The suggested fix is to declare it automatically based on the return value of the fn (using typechecking inference):

```
function fn<T>(): FNResult<T> {
  return { a: 1, b: 's', log: (msg) => msg+'', kill: function <T>() { return 1 } }
}
```

# TODO: 

 * add jsdoc (configurable ) to new  members  and new interface
 * support unnamed functions and arrow
 * we could offer three alternatives : declare interface, declare type or declare class. see config
 * ISSUE : support spreadproperty assignament and simple property assignment : i.e:  {simple} and {...spread}
 * TODO: members type params (generics) - both in interface and in members and in params.
 * arrow functions with return and without braces _ error!
 * TODO: constructors
 * TODO: getters / setters ? 
 * TODO: test jsdoc
 * TODO: check if diagnostic is in the same position  in predicate 
 * TODO: appearing in places it shouldnt


 Example showing things that works and things that doesn't: 

 ```
 function g(): GResult {	// THIS works
  return { a: 1, b: 's' }
}
const g2 = (): GResult2 => ({ a: 1, b: 's' })// TODO: doesn't work
const g3 = (): GResult3 => { return { a: 1, b: 's' } } // TODO: doesn't work
const h2 = (): HResult2 => ({ // TODO this doesn't work - error!
  a: 1, b: 's', log: (msg) => true, kill: function () { return 1 }
})
const h3 = (): HelloType => {  // TODO this doesn't work 
  return {
    a: 1, b: 's', log: (msg) => true, kill: function () { return 1 }
  }
}
function h(): Magallanes { //TODO: generates empty interface 
  return {
    a: 1, b: 's', log: (msg: boolean) => { return true }, kill: function () { return 1 }
  }
}
function fn<T>(): FNResult<T> { // THIS works
  return { a: 1, b: 's', log: (msg: string) => { return Math.random() > 0.1 ? true : 'foo' }, kill: function <T>() { return 1 } }
}```

*/

export const declareReturnType: CodeFix = {
  name: 'declareReturnType',

  config: {
    // TODO: what should we declare. Could be 'interface'|'class'|'type'
    declarationKind: 'interface',
    // TODO: could be true|false|string . add jsdoc to new class/interface declaration
    jsdoc: true,
    // TODO: create interface decl in a separate file ? 
    inNewFile: false
  },

  predicate: (arg: CodeFixOptions): boolean => {
    if (arg.containingTargetLight.kind === ts.SyntaxKind.Identifier &&
      arg.containingTargetLight.parent.kind === ts.SyntaxKind.TypeReference &&
      arg.diagnostics.find(d => d.code === 2304 && d.start === arg.containingTargetLight.getStart()
      )) {
      return true
    }
    else {
      arg.log('predicate false because child.kind dont match ' + getKindName(arg.containingTargetLight.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => `Declare interface "${arg.containingTargetLight.getText()}"`,

  apply: (arg: CodeFixOptions) => {
    const decl: Node & SignaturedDeclaration = arg.simpleNode.getAncestors().find(TypeGuards.isSignaturedDeclaration)
    const interfaceStructure = fromNow(
      () => inferReturnType(decl, arg),
      t => arg.log('apply inferReturnType took ' + t)
    )

    const tmpFile = arg.simpleProject.createSourceFile('tmp.ts')
    tmpFile.insertInterface(0, interfaceStructure)
    const code = tmpFile.getText()

    const siblingAncestor = arg.simpleNode.getAncestors().find(a => TypeGuards.isSourceFile(a.getParent()))

    return buildRefactorEditInfo(arg.sourceFile, code, siblingAncestor ? siblingAncestor.getStart() : 0)
  }
}


const inferReturnType = (decl: Node & SignaturedDeclaration, arg: CodeFixOptions): InterfaceDeclarationStructure => {
  const project = arg.simpleProject
  const tmpFunctionName = `__function_name_${Date.now()}_`
  const tmpVariableName = `__variable_name_${Date.now()}_`
  const tmpSourceFile = fromNow(
    () => project.createSourceFile(`tmp2.ts`, `const ${tmpFunctionName} = ${decl.getText()};  const ${tmpVariableName} = ${tmpFunctionName}()`, { overwrite: true }),
    (t) => arg.log('apply inferReturnType createSourceFile took ' + t)
  )
  const tmpFuncDecl = tmpSourceFile.getVariableDeclaration(tmpFunctionName).getInitializer()
  if (!TypeGuards.isSignaturedDeclaration(tmpFuncDecl)) {
    arg.log(`apply aborted because !TypeGuards.isSignaturedDeclaration(tmpFuncDecl)`)
    return
  }
  const typeargs = tmpFuncDecl.getReturnType().getTypeArguments()
  fromNow(
    () => tmpFuncDecl.removeReturnType(),
    t => arg.log(`apply inferReturnType tmpDecl.removeReturnType() took ${t}`)
  )
  const tmpVarDecl = tmpSourceFile.getVariableDeclaration(tmpVariableName)
  if (!tmpVarDecl) {
    arg.log(`apply aborted because !tmpVarDecl`)
    return
  }
  const type = fromNow(
    () => project.getTypeChecker().getTypeAtLocation(tmpVarDecl),
    t => arg.log(`apply inferReturnType getTypeChecker().getTypeAtLocation took ${t}`)
  )
  const intStructureT0 = now()
  const intStructure: InterfaceDeclarationStructure = {
    // docs: ['TODO: Document me'],
    name: decl.getReturnTypeNode().getText(),
    properties: type.getProperties()
      .filter(p => {
        const v = p.getValueDeclaration();
        return TypeGuards.isPropertyAssignment(v) && !v.getInitializer().getKindName().includes('Function')
      })
      .map(p => {
        const v = p.getValueDeclaration()
        return {
          // docs: ['TODO: Document me'],
          name: p.getName(),
          type: project.getTypeChecker().getTypeAtLocation(p.getValueDeclaration()).getText(),
          val: p.getValueDeclaration(),
          hasQuestionToken: TypeGuards.isPropertyAssignment(v) && v.hasQuestionToken(),
        }
      }),
    methods: type.getProperties()
      .filter(p => {
        const v = p.getValueDeclaration();
        return TypeGuards.isPropertyAssignment(v) && v.getInitializer().getKindName().includes('Function')
      })
      .map(p => {
        const v = p.getValueDeclaration()
        if (!TypeGuards.isPropertyAssignment(v)) {
          return // TODO: ignoring spread property assignament and simple property assignment : i.e:  {simple} and {...spread}
          // TODO: LOG
        }
        const init = v.getInitializer()
        if (!TypeGuards.isArrowFunction(init) && !TypeGuards.isFunctionExpression(init)) {
          return
        }
        return {
          // docs: ['TODO: Document me'],
          name: p.getName(),
          returnType: init.getReturnType() ? init.getReturnType().getText() : 'any',
          parameters: init.getParameters().map(pa => ({
            name: pa.getName(),
            type: pa.getType().isTypeParameter() ? pa.getTypeNode().getText() : pa.getType().getText(),
            hasQuestionToken: pa.hasInitializer() || pa.hasQuestionToken(),
          })),
          typeParameters: init.getTypeParameters().map(p => ({
            name: p.getName(),
            constrain: p.getConstraint() && p.getConstraint().getText()
          })),
        }
      })
      .filter(p => p !== undefined),
    typeParameters: typeargs.map(ta => ({ name: ta.getSymbol().getName() })),
  }
  fromNow(
    () => tmpSourceFile.delete(),
    t => arg.log(`apply inferReturnType tmpSourceFile.delete() took ${t}`)
  )
  arg.log(`apply inferReturnType create InterfaceStructure took ${timeFrom(intStructureT0)}`)
  return intStructure
}
