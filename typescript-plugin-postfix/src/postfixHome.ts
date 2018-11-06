import { Postfix } from "./types";
import { DeclareVariablePostFix, DeclareVariablePostfixConfig } from "./declareVariablePostfix";
import * as ts from 'typescript'
import { ConsolePostfixConfig, ConsolePostFix } from './consolePostfix';


const allPostfix : Postfix[]= [
  new DeclareVariablePostFix( new DeclareVariablePostfixConfig('declare let variable', 'let')),
  new DeclareVariablePostFix( new DeclareVariablePostfixConfig('declare const variable', 'const')),
  new DeclareVariablePostFix( new DeclareVariablePostfixConfig('declare var variable', 'var')), 
  new ConsolePostFix(new ConsolePostfixConfig('wrap with console.log', 'log')),
  new ConsolePostFix(new ConsolePostfixConfig('wrap with console.error', 'error')),
  new ConsolePostFix(new ConsolePostfixConfig('wrap with console.warn', 'warn')),
]

export function getAllPostfix(): Postfix[] {
  return allPostfix
}