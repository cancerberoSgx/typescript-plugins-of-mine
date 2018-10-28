
import Project from 'ts-simple-ast';
import { removeComments } from '../src/code-fix/removeComments';
import { testCodeFixRefactorEditInfo2 } from './testUtil';

describe('removeComments', () => {

  it('basic', async () => {
    const code = `
var a =1
//laksd lkaj sldas
function f(){
  // laksjldkajs
  const a = 6
  //TODO: something
  let i = 2
  // Heads up!: 
  var hh=1
  //lksksks
}
//final
`

    const project = new Project()
    const file = project.createSourceFile('foo.ts', code)
    const result = testCodeFixRefactorEditInfo2(file, project, { pos: 0, end: code.length }, removeComments.name)
    expect(JSON.stringify(result.edits[0].textChanges)).toBe('[{"newText":"","span":{"start":10,"length":18}},{"newText":"","span":{"start":45,"length":14}},{"newText":"","span":{"start":76,"length":17}},{"newText":"","span":{"start":108,"length":14}},{"newText":"","span":{"start":136,"length":9}},{"newText":"","span":{"start":148,"length":7}}]')
  })


})

