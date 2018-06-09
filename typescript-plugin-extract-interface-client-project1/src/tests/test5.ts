// create constructor and declare variable
class Alpha {
}

// declare constructor and
function main(): Alpha {
  return new Alpha('hello', 1, new Date())
}


// add missing const
value1 = 1

// change const to let
value1 = null

// declare type inferring from return value
function fn<T>(): FNResult<T> {
  return {
    a: 1,
    b: 's',
    log: (string) => { return Math.random() },
    kill: function <T>() { return 1 }
  }
}





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



// split var decls

const underscore = require('underscore'), moment = require('moment'), handlebars = require('handlebars');  // split var decls

let a23 = 1, PI = 3.14// split var decls




// to named params

function foo(a: number, b: string[], c: (n: number) => boolean[], d?: boolean, e = 3.14): () => boolean { return () => true }





// implement interface


interface SomeInterface extends SuperInterface1, SuperInterface2 {
  prop1: { s: string, n: Date }[]
}
interface SomeInterface2 {
  method3(p: string): Date
}
const obj: SomeInterface2 = {
  method3(p: string, b: boolean): Date {
    throw new Error("Method not implemented.");
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
