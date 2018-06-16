import { codeFixCreateConstructor } from './code-fix/declareConstructor';
import { codeFixCreateVariable } from './code-fix/declareVariable';
import { declareClass } from './code-fix/declareClass';
import { const2let } from './code-fix/const2let';
import { nameFunction } from './code-fix/nameFunction';
import { declareReturnType } from './code-fix/declareReturnType';
import { declareMember } from './code-fix/declareMember';
import { addReturnStatement } from './code-fix/addReturnStatement';
import { implementInterfaceObjectLiteral } from './code-fix/implementInterfaceObjectLiteral';
import { implementInterfaceMember } from './code-fix/implementInterfaceMember';
import { renameVariable } from './code-fix/variableRename';
import { splitVariableDeclarationList } from './code-fix/splitVariableDeclarationList';
import { toNamedParameters } from './code-fix/toNamedParams';
import { memberChangeScope } from './code-fix/memberChangeScope';
import { removeEmptyLines } from './code-fix/removeEmptyLines';
import { arrowFunctionBodyTransformations } from './code-fix/arrowFunctionTransformations';
import { extractInterface } from './code-fix/extractInterface';
import { methodDelegate } from './code-fix/methodDelegate';
import { template2Literal } from './code-fix/template2Literal';
import { stringChangeQuoteChar } from './code-fix/stringChangeQuoteChar';

import { CodeFix } from 'typescript-plugin-util';

export { CodeFix, CodeFixOptions } from 'typescript-plugin-util';

export const codeFixes: CodeFix[] = [codeFixCreateConstructor, codeFixCreateVariable, declareClass,  const2let, nameFunction, implementInterfaceObjectLiteral, declareReturnType, declareMember, addReturnStatement, implementInterfaceMember, renameVariable, splitVariableDeclarationList, toNamedParameters, memberChangeScope, removeEmptyLines, arrowFunctionBodyTransformations, extractInterface, methodDelegate, template2Literal, stringChangeQuoteChar]
