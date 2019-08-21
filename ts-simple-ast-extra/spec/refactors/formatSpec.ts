import { Project } from 'ts-morph'
import { format } from '../../src'
import { expectEqualsAndDiff, expectNoErrors } from '../testUtil'
describe('format', () => {
  const code = `
const {r, log, g} = require('f');
class C{
m():number[]{
return [
                                1,
  2,     3
]}}
function f(){
alert(1)
log(2,function(){
return 1 + g(a=>{
return "2"
})
});
}
export const c = 1;var ggg = 1;
f();
[1,2].join('');
(true||false) && f()
for(let i = 0; i< 2; i++){}
    `

  it('should format according using default settings', () => {
    const project = new Project()
    const file = project.createSourceFile('f1.ts', code)
    expectNoErrors(project)
    const output = format({ file, project })
    const expected = `
const { r, log, g } = require('f');
class C {
    m(): number[] {
        return [
            1,
            2, 3
        ]    
}
}
function f() {
    alert(1)
    log(2, function() {
        return 1 + g(a => {
            return "2"
        })
    });
}
export const c = 1; var ggg = 1;
f();
[1, 2].join('');
(true || false) && f()
for (let i = 0; i < 2; i++) { }
`.trim()
    expectEqualsAndDiff(output.getText().trim(), expected)
  })

  it('should remove semicolons and tab 2 spaces', () => {
    const project = new Project()
    expectNoErrors(project)
    const file = project.createSourceFile('f1.ts', code)
    const output = format({
      file,
      project,
      trailingSemicolons: 'never',
      indentSize: 2
    })

    const expected = `
const { r, log, g } = require('f')
class C {
  m(): number[] {
    return [
      1,
      2, 3
    ]  
}
}
function f() {
  alert(1)
  log(2, function() {
    return 1 + g(a => {
      return "2"
    })
  })
}
export const c = 1; var ggg = 1
f();
[1, 2].join('');
(true || false) && f()
for (let i = 0; i < 2; i++) { }
`.trim()
    expectEqualsAndDiff(output.getText().trim(), expected)
  })
})
