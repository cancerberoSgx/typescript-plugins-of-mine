const a = 2 + 3
function bigfish()                            { return 1 }
// const bigger = f()
var hoo = ['asd']
const cece = a + bigfish()
let arr = ['s', 't']
function x() { return arr && arr.length ? arr : [1, 28276382736827368472364, 3] }

interface Person{}
interface Shoe{
  wear(p: Person):void
}
class Shoe {
  color = 123
}
/***@ 
// For evaluating code you can use a comment like this one that starts with
// Your code will be evaluated in the editor's server and printed back here
// you could have many of these comments and you dont need to select any text
// comment content need to be valid JavaScript. (in the future we'll be supporting selecting code to exec)
// Try to execute this comment activating this refactor again. This is your context interface: 

// interface IEvalContext{
//   ts: typeof ts
//   target: Node
//   arg: CodeFixOptions
//   print(s):void
// }

!function(){
var s = ''
  for(var i in c){s+=i+'=='+c[i]+', '}
  c.print('jsjs: '+s)


//   c.print('something simple from editor') // all string printed will be printed back in the editor

// c.print('selected node kind is ' + c.target.getKindName()) // access to selected node

// return 'good bye' // this last expression will be the return value
}()
@***/RESULT: (undefined) undefined
Output:
jsjs: _printed==, arg==[object Object], target==undefined, ts==[object Object], 
No errors