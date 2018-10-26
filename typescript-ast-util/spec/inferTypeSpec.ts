import * as ts from 'typescript';
import { compileSource, findChild, getKindName, getTypeStringFor, hasDeclaredType } from "../src";

describe('type inference', () => {
  
  it('getTypeStringFor', () => {

    const code1 = `
const a=1
function f(): {a: number, b: string[]} {
  return {a:1, b: []}
}
function k(){return []}
var h :Array<String> = ['asd'] 
const b = a+2
const c = 1+4
const d = f()
const typedConst: Array<Date> = []
class CCC{ /* move-class /home/sg */

}
const numberVariable = 1
const stringVariable = '1'
`
    const { program, fileName, tsconfigPath } = compileSource(code1)
    const sourceFile = program.getSourceFile(fileName)

    if (!sourceFile) {
      return fail()
    }

    let a = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'a')
    if (!a) {
      return fail()
    }
    const at = program.getTypeChecker().getTypeAtLocation(a)
    expect(at.symbol).toBeUndefined()
    expect(hasDeclaredType(a, program)).toBe(false)

    getKindName(a.kind)
    let typedConst = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'typedConst')
    if (!typedConst) {
      return fail()
    }
    const typedConstType = program.getTypeChecker().getTypeAtLocation(typedConst)
    expect(typedConstType.symbol.escapedName.toString()).toBe('Array')

    let c = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'c')
    if (!c) {
      return fail()
    }
    expect(getTypeStringFor(c, program)).toBe('number')

    let b = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'b')
    if (!b) {
      return fail()
    }
    expect(getTypeStringFor(c, program)).toBe('number')

    let d = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'd')
    if (!d) {
      return fail()
    }
    expect(getTypeStringFor(d, program).replace(/\s+/g, '')).toBe('{a:number;b:string[];}')

    let f = findChild(sourceFile, c => c.kind == ts.SyntaxKind.FunctionDeclaration && ((c as ts.FunctionDeclaration).name as ts.Identifier).escapedText == 'f')
    if (!f) {
      return fail()
    }
    expect(getTypeStringFor(f, program).replace(/\s+/g, '')).toBe('()=>{a:number;b:string[];}')

    let h = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'h')
    if (!h) {
      return fail()
    }
    expect(hasDeclaredType(h, program)).toBe(true)

    let k = findChild(sourceFile, c => c.kind == ts.SyntaxKind.FunctionDeclaration && ((c as ts.FunctionDeclaration).name as ts.Identifier).escapedText == 'k') as ts.FunctionDeclaration
    if (!k) {
      return fail()
    }

    let ccc = findChild(sourceFile, c => c.kind == ts.SyntaxKind.ClassDeclaration && ((c as ts.ClassDeclaration).name as ts.Identifier).escapedText == 'CCC')
    if (!ccc) {
      return fail()
    }

    let numberVariable = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'numberVariable')
    if (!numberVariable) {
      return fail()
    }
    expect(hasDeclaredType(numberVariable, program)).toBe(false)
    expect(getTypeStringFor(numberVariable, program).replace(/\s+/g, '')).toBe('number')

    let stringVariable = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'stringVariable')
    if (!stringVariable) {
      return fail()
    }
    expect(hasDeclaredType(stringVariable, program)).toBe(false)
    expect(getTypeStringFor(stringVariable, program).replace(/\s+/g, '')).toBe('string')

  })
})





// const TypeFormatFlags = ts.TypeFormatFlags
// const NodeBuilderFlags= ts.NodeBuilderFlags


// let  flags =  0|TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | TypeFormatFlags.MultilineObjectLiterals | TypeFormatFlags.WriteTypeArgumentsOfSignature | TypeFormatFlags.OmitParameterModifiers;
// const type = getTypeFor(f, program)

//     console.log(program.getTypeChecker().typeToString(type, f, flags))

//     // console.log(program.getTypeChecker().typeToString(type, f, 0|TypeFormatFlags.WriteTypeArgumentsOfSignature))

//     // console.log(program.getTypeChecker().typeToString(type, f, 0|ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.AllowUniqueESSymbolType))

//     // console.log(program.getTypeChecker().typeToString(type, f, NodeBuilderFlags.MultilineObjectLiterals | TypeFormatFlags.WriteClassExpressionAsTypeLiteral | NodeBuilderFlags.UseTypeOfFunction | NodeBuilderFlags.UseStructuralFallback | NodeBuilderFlags.AllowEmptyTuple))



// console.log(program.getTypeChecker().typeToString(type,undefined,  TypeFormatFlags.NoTruncation | TypeFormatFlags.WriteArrayAsGenericType | TypeFormatFlags.UseStructuralFallback | TypeFormatFlags.WriteTypeArgumentsOfSignature |
// TypeFormatFlags.      UseFullyQualifiedType | TypeFormatFlags.SuppressAnyReturnType | TypeFormatFlags.MultilineObjectLiterals | TypeFormatFlags.WriteClassExpressionAsTypeLiteral |
// TypeFormatFlags.OmitParameterModifiers | TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | TypeFormatFlags.AllowUniqueESSymbolType | TypeFormatFlags.InTypeAlias,))
// console.log(program.getTypeChecker().typeToString(type, f, 0))
//     console.log(program.getTypeChecker().typeToString(type, f,  -1|TypeFormatFlags.WriteArrowStyleSignature))
//     console.log(program.getTypeChecker().typeToString(type, f,  -1&TypeFormatFlags.WriteArrowStyleSignature))
//     // console.log(program.getTypeChecker().typeToString(type, f,  TypeFormatFlags.OmitParameterModifiers&TypeFormatFlags.WriteArrowStyleSignature))
//     // console.log(program.getTypeChecker().typeToString(type, f, 0|ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.AllowUniqueESSymbolType))  console.log(program.getTypeChecker().typeToString(type, f, 0|ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.AllowUniqueESSymbolType))  console.log(program.getTypeChecker().typeToString(type, f, 0|ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.AllowUniqueESSymbolType))



//     Object.keys(typeFormatFlagsToMap()).forEach(k=>{
//       console.log(program.getTypeChecker().typeToString(type, f,  typeFormatFlagsToMap()[k]))
//     //   const v = syntaxKindToMap()[k]
//     //   const type = getTypeFor(f, program)
//     //   console.log(k, '\t\t\t\t\t' , program.getTypeChecker().typeToString(type, f, v))
//     })
// // debugger;
//     // program.getTypeChecker().typet
// // const s = ts.createMethodSignature(k.typeParameters, k.parameters, k.type, k.name, k.questionToken)
// // const ss = program.getTypeChecker().signatureToSignatureDeclaration(getTypeFor(k, program).getConstructSignatures()[0], ts.SyntaxKind.FunctionDeclaration)


//     // expect(getTypeStringFor(k, program).replace(/\s+/g, '')).toBe('()=>string[]')

//     // const changes = getFileTextChanges(k)

