import { NoSubstitutionTemplateLiteral, StringLiteral, TypeGuards } from "ts-simple-ast";
import * as ts from 'typescript';
import { CodeFix, CodeFixOptions } from "../codeFixes";
import { quote, changeQuoteChar } from "../util";

/**

# Description

change string quote character - allowing to change a isNoSubstitutionTemplateLiteral to a regular string. 

Note : for going back and forward from template strings use the fix gemplate2literal - this one is only for simple string literals
 
# Example

# TODO

*/

export class StringChangeQuoteChar implements CodeFix {

  name = 'stringChangeQuoteChar'

  config = {
  }

  private newQuotes: string

  predicate(arg: CodeFixOptions): boolean {
    this.newQuotes = undefined
    if(ts.isStringLiteral(arg.containingTargetLight)){
      this.newQuotes = arg.containingTargetLight.getText().startsWith('\'') ? '"' : '\''
    }
    else if(ts.isNoSubstitutionTemplateLiteral(arg.containingTargetLight)){
      this.newQuotes = '"'
    }
    return !!this.newQuotes;
  }

  description(arg: CodeFixOptions): string {
    return `Change string quotes to ${this.newQuotes}`
  }

  apply(arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void {
    const node = arg.simpleNode
    if (this.newQuotes && (TypeGuards.isStringLiteral(node) || TypeGuards.isNoSubstitutionTemplateLiteral(node))) {
      changeQuoteChar(node, this.newQuotes)
      return
    }
  }
}

export const stringChangeQuoteChar = new StringChangeQuoteChar()
