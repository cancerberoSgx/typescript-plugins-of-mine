// create constructor and declare variable
class Alpha {
}

// declare constructor and
function main() {
  alpha2 = new Alpha('hello', 1, new Date())
}

// declare variable
counter = 9

// declare constructor declare variable alpha
alpha1 = new Alpha('hello')

// add missing const
value1 = alpha1.getData()

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

const obj = {
  foo: () => { return 1 }
}
const val: string[] = obj.bar(1, ['w'], true) // declare missing member to an object literal
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
  m(s: number[]) { this.hello.grasp(s, [false, true]) } // same as before - instance is property accessor
}



// split var decls

const underscore = require('underscore'), moment = require('moment'), handlebars = require('handlebars');  // split var decls

let a23 = 1, PI = 3.14// split var decls




// to named params

function foo(a: number, b: string[], c: (n: number) => boolean[], d?: boolean, e = 3.14): () => boolean { return () => true }






interface Named {
  name: string
}
const named: Named = {
  name: 'seba',
  lastname: 'gurin' // TODO: issue:  declare missing member not working - issue
}
class Unit {
  energy: number
}
const unit: Unit = {
  energy: 123, color: 'red' // TODO: issue:  declare missing member not working - issue
}
