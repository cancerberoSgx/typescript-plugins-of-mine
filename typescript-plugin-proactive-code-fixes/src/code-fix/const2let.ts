
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { VariableDeclarationKind } from 'ts-simple-ast';

/*

# description

reassigning a const variable is an error  this fix suggest changing it to let:

# example
```
const a = 1
a = 2
```
# Attack: 	"code": "2540",	"message": "Cannot assign to 'a' because it is a constant or a read-only property.",

  */
export const const2let: CodeFix = {
  name: 'const2let',
  config: { changeTo: 'const' }, // to change to let or var
  predicate: (arg: CodeFixOptions): boolean => {
    if (!arg.diagnostics.find(d => d.code === 2540)) {  
      return false
    }
    if (arg.containingTargetLight.kind === ts.SyntaxKind.Identifier){
      return true
    }
    else {
      arg.log('codeFixCreateVariable predicate false because child.kind dont match ' + getKindName(arg.containingTargetLight.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => `Change "const ${arg.containingTarget.getText()}" to "let ${arg.containingTarget.getText()}"`,

  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const id = arg.simpleNode
    if(!id||id.getKind()!== ts.SyntaxKind.Identifier){
      arg.log(`codeFixCreateVariable apply cannot exec because of this !id||id.getKind()!== ts.SyntaxKind.Identifier  `)
      return  
    }
    else if(id.getParent() && id.getParent()!.getParent() && id.getParent()!.getParent()!.getKind()===ts.SyntaxKind.ExpressionStatement) { 
      const declStatement = id.getSourceFile().getVariableStatement(v=>v.getDeclarationKind()===VariableDeclarationKind.Const && !!v.getDeclarations().find(vv=>vv.getName()===id.getText()))
      declStatement.setDeclarationKind(VariableDeclarationKind.Let)
    }
    else {
      arg.log(`codeFixCreateVariable apply cannot exec because this was false: id.getParent() && id.getParent()!.getParent() && id.getParent()!.getParent()!.getKind()===ts.SyntaxKind.ExpressionStatement `)
    }
  }

}