// declare constructor
class Alpha {
}
function main(): Alpha {
  return new Alpha('hello', 1, new Date())
}





// add missing const
value1 = 1





// change const to let
const value2 = '1'
value12 = '2'





// declare type inferring from return value
function fn<T>(): FNResult<T> {
  return {
    a: 1,
    b: 's',
    log: (string) => { return Math.random() },
    kill: function <T>() { return 1 }
  }
}





// split var decls
const underscore = require('underscore'), moment = require('moment'), handlebars = require('handlebars')





// variable rename 

let duplicatedVariable = 1
let duplicatedVariable = 's'




// to named params
function foo(a: number, b: string[], c: (n: number) => boolean[], d?: boolean, e = 3.14): () => boolean {
  return () => true
}




//add return statement
const other = <T>(a: T): T[] => { }




// name function 
function () { }




// declare interface and class 
class Onion extends NonExistent implements NonExistentInterface, ExistentInterface2 { }
class ExistentInterface2 { }





// declare missing member
const obj123 = {
  foo: () => { return 1 }
}
const val: string[] = obj123.bar(1, ['w'], true) // declare missing member to an object literal
interface Hello { }
const hello: Hello = {}
let counter123: string[] = hello.world([[1, 2, 3], [4, 5]]) // declare missing member to instance's interface
const k = hello.mama(1, 2, 3) + ' how are you?' // same as before - notice inferred return type
function f(h: Hello) {
  h.fromFunc = true // same as before - instance is parameter
}
var x: Date = new Date(hello.timeWhen('born')) // same as before - notice inferred return type
class C {
  hello: Hello
  m(s: number[]) { return this.hello.grasp(s, [false, true]) } // same as before - instance is property accessor
}
new C().non()




// implement interface
interface SomeInterface extends SuperInterface1, SuperInterface2 {
  prop1: { s: string, n: Date }[]
}
interface SomeInterface2 {
  method3(p: string): Date
}
const obj: SomeInterface2 = {
  method3(validation: RegExp, p: string, b: boolean, created?: Date): { color: string, modified: Date } {
    return { color: 'red', modified: new Date() }
  }
}
interface SomeInterface3 {
  method5(p: { created: Date, predicate: () => boolean }): Date
}
interface SuperInterface2 { }
interface SuperInterface1 extends SomeInterface3 { }
abstract class OtherImplementation implements SuperInterface1 { }
class SomeImplementation extends OtherImplementation implements SomeInterface, SomeInterface2 {
  method3(p: string): Date {
    throw new Error("Method not implemented.");
  }
  method1(param: number): number[] {
    throw new Error("Method not implemented.");
  }
  method5(p: string, foo: boolean, hey?: number[][]): Date[] { return null }
}
class Class2 implements SomeInterface {
  prop1: boolean[]
}


