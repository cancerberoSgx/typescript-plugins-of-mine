import { Project } from 'ts-morph'
import { format } from '../../src'
import { expectEqualsAndDiff, expectNoErrors } from '../testUtil'
import { quotes } from '../../src/refactor/quotes'

describe('should change strings in templates, and change only spaces', () => {
  it('simple all', () => {
    const project = new Project()
    const code = `
var a='',
  b="",
  c:["",
  ''],
  d={x:'',
  y:"asda",
  z: \`asd""''\${'asdas'}asd""''\${"askljdh"}\`
}    `.trim()
    const expected = `
var a='',
  b='',
  c:['',
  ''],
  d={x:'',
  y:'asda',
  z: \`asd""''\${'asdas'}asd""''\${'askljdh'}\`
}`.trim()
    const file = project.createSourceFile('f1.ts', code)
    expectNoErrors(project)
    quotes({ file, project, quotePreference: 'single' })
    expectEqualsAndDiff(file.getFullText().trim(), expected)
    expectNoErrors(project)
  })
})
