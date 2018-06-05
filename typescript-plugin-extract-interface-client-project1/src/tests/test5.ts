class Alpha {
}

function main() {
  alpha2 = new Alpha('hello', 1, new Date()) // declare constructor and
}
counter = 9 // declare variable


const alpha1 = new Alpha('hello') // declare constructor declare variable alpha


value1 = alpha1.getData() // add missing
value1 = null // const to let

// declare type inferring from return value
function fn<T>(): FNResult<T> {
  return {
    a: 1,
    b: 's',
    log: (string) => { return Math.random() },
    kill: function <T>() { return 1 }
  }
}


interface Named {
  name: string
}
const named: Named = {
  name: 'seba',
  lastname: 'gurin'
}
class Unit {
  energy: number
}
const unit: Unit = {
  energy: 123, color: 'red'
}

const underscore = require('underscore'), moment = require('moment'), handlebars = require('handlebars');  // split var decls

let a23 = 1, PI = 3.14// split var decls


function foo (a: number, b: string[], c: (n:number)=>boolean[], d?: boolean, e=3.14): ()=>boolean {return ()=>true} // to named params
