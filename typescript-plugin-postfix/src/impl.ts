import { Postfix } from "./types";

export abstract class AbstractPostfix implements Postfix {
  name: string;
  description: string;
  completion: string;
  predicate(fileName: string, position: number): boolean {
    
  }
  subExpressionPredicate(fileName: string, position: number): ts.Node {
    throw new Error("Method not implemented.");
  }
  execute(expression: ts.Node, fileName: string, position: number) {
    throw new Error("Method not implemented.");
  }
}
export class PostfixIf extends AbstractPostfix {

}