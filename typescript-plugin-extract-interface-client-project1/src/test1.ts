import { EventEmitter } from "events";

export interface IThing { }
export interface ITransport extends IThing { }

export class Transport implements ITransport {
  maxSpeed: number = 1
  go(to: { x: number, y: number }): Promise<number> { return Promise.resolve(1) }
}

/**
 * description of something classy
 * 
 * Another paragraph with ex: 
 * 
 */
class A {
  /**
   * @param b hello
   * @return the number one
   */
  m(b: string): number { return 1 }
}

/**
 * the description for a Vehicle
 * @param T type of the passengers
 */
export class Vehicle<T> {
  constructor(iron: number) {
    this.n = 1
  }
  n: number
  engine: { iron: number, gas: Array<string> } = { iron: 3, gas: [] }
  /**
   * start the engine is the first thing before moving we need to do in a vehicle
   * @param strong ohw strong should be the the hand that pull tht trigger?
   */
  public async startEngine(strong: string[]): Promise<boolean> {
    return false
  }
  private privateMetdho1(): boolean {
    return false
  }
  static staticMethod(): boolean {
    return false
  }
  /* this si not jsdoc  */
  none(): void {
    if (new Date().getTime()) {
      console.log();
    }
    else {
      console.error();
    }
  }
}`
AST of selected ClassDeclaration:  
 #0 error ClassDeclaration
 #0  ExportKeyword
 #1 Vehicle Identifier
 #2 T TypeParameter
   #0 T Identifier
 #3 n Constructor
   #0 iron Parameter
     #0 iron Identifier
     #1  NumberKeyword
   #1 n Block
     #0 n ExpressionStatement
       #0 n BinaryExpression
         #0 n PropertyAccessExpression
           #0  ThisKeyword
           #1 n Identifier
         #1  EqualsToken
         #2  NumericLiteral
 #4 n PropertyDeclaration
   #0 n Identifier
   #1  NumberKeyword
 #5 gas PropertyDeclaration
   #0 engine Identifier
   #1 Array TypeLiteral
     #0 iron PropertySignature
       #0 iron Identifier
       #1  NumberKeyword
     #1 Array PropertySignature
       #0 gas Identifier
       #1 Array TypeReference
         #0 Array Identifier
         #1  StringKeyword
   #2 gas ObjectLiteralExpression
     #0 iron PropertyAssignment
       #0 iron Identifier
       #1  NumericLiteral
     #1 gas PropertyAssignment
       #0 gas Identifier
       #1  ArrayLiteralExpression
 #6 Promise MethodDeclaration
   #0  PublicKeyword
   #1  AsyncKeyword
   #2 startEngine Identifier
   #3 strong Parameter
     #0 strong Identifier
     #1  ArrayType
       #0  StringKeyword
   #4 Promise TypeReference
     #0 Promise Identifier
     #1  BooleanKeyword
   #5  Block
     #0  ReturnStatement
       #0  FalseKeyword
 #7 privateMetdho1 MethodDeclaration
   #0  PrivateKeyword
   #1 privateMetdho1 Identifier
   #2  BooleanKeyword
   #3  Block
     #0  ReturnStatement
       #0  FalseKeyword
 #8 staticMethod MethodDeclaration
   #0  StaticKeyword
   #1 staticMethod Identifier
   #2  BooleanKeyword
   #3  Block
     #0  ReturnStatement
       #0  FalseKeyword
 #9 error MethodDeclaration
   #0 none Identifier
   #1  VoidKeyword
   #2 error Block
     #0 error IfStatement
       #0 getTime CallExpression
         #0 getTime PropertyAccessExpression
           #0 Date NewExpression
             #0 Date Identifier
           #1 getTime Identifier
       #1 log Block
         #0 log ExpressionStatement
           #0 log CallExpression
             #0 log PropertyAccessExpression
               #0 console Identifier
               #1 log Identifier
       #2 error Block
         #0 error ExpressionStatement
           #0 error CallExpression
             #0 error PropertyAccessExpression
               #0 console Identifier
               #1 error Identifier
`