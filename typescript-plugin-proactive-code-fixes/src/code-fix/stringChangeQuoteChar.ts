import { NoSubstitutionTemplateLiteral, StringLiteral, TypeGuards } from "ts-simple-ast";
import * as ts from 'typescript';
import { CodeFix, CodeFixOptions } from "../codeFixes";
import { quote, changeQuoteChar, buildRefactorEditInfo } from "../util";

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

  apply(arg: CodeFixOptions) {
    const node = arg.simpleNode
    if (this.newQuotes && (TypeGuards.isStringLiteral(node) || TypeGuards.isNoSubstitutionTemplateLiteral(node))) {
      // changeQuoteChar(node, this.newQuotes)
      const code = quote(node.getLiteralText(), this.newQuotes)

      return buildRefactorEditInfo(arg.sourceFile, code, node.getStart(), node.getWidth())

      // return
    }
  }
}

export const stringChangeQuoteChar = new StringChangeQuoteChar()
