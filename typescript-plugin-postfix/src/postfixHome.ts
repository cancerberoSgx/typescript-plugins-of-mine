import { Postfix } from "./types";
import { DeclareVariablePostFix, DeclareVariablePostfixConfig } from "./declareVariablePostfix";
import * as ts from 'typescript'


const allPostfix : Postfix[]= [
  new DeclareVariablePostFix( new DeclareVariablePostfixConfig('declare let variable', 'let')),
  new DeclareVariablePostFix( new DeclareVariablePostfixConfig('declare const variable', 'const')),
  new DeclareVariablePostFix( new DeclareVariablePostfixConfig('declare var variable', 'var'))
]

export function getAllPostfix(): Postfix[] {
  return allPostfix
}