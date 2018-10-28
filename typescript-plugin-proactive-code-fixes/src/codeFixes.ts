import { CodeFix } from 'ts-simple-ast-extra';
import { addReturnStatement } from './code-fix/addReturnStatement';
import { arrowFunctionBodyTransformations } from './code-fix/arrowFunctionTransformations';
import { const2let } from './code-fix/const2let';
import { declareClass } from './code-fix/declareClass';
import { codeFixCreateConstructor } from './code-fix/declareConstructor';
import { declareMember } from './code-fix/declareMember';
import { declareReturnType } from './code-fix/declareReturnType';
import { codeFixCreateVariable } from './code-fix/declareVariable';
import { extractInterface } from './code-fix/extractInterface';
import { implementInterfaceMember } from './code-fix/implementInterfaceMember';
import { implementInterfaceObjectLiteral } from './code-fix/implementInterfaceObjectLiteral';
import { memberChangeScope } from './code-fix/memberChangeScope';
import { methodDelegate } from './code-fix/methodDelegate';
import { nameFunction } from './code-fix/nameFunction';
import { removeEmptyLines } from './code-fix/removeEmptyLines';
import { splitVariableDeclarationList } from './code-fix/splitVariableDeclarationList';
import { stringChangeQuoteChar } from './code-fix/stringChangeQuoteChar';
import { template2Literal } from './code-fix/template2Literal';
import { toNamedParameters } from './code-fix/toNamedParams';
import { renameVariable } from './code-fix/variableRename';
import { organizeImportsAndFormat } from './code-fix/organizeImportsAndFormat';
import { removeComments } from './code-fix/removeComments';

export {CodeFix, CodeFixOptions} from 'ts-simple-ast-extra';

export const codeFixes: CodeFix[] = [codeFixCreateConstructor, codeFixCreateVariable, declareClass, const2let, nameFunction, implementInterfaceObjectLiteral, declareReturnType, declareMember, addReturnStatement, implementInterfaceMember, renameVariable, splitVariableDeclarationList, toNamedParameters, memberChangeScope, removeEmptyLines, arrowFunctionBodyTransformations, extractInterface, methodDelegate, template2Literal, stringChangeQuoteChar, organizeImportsAndFormat, removeComments]
