import { Project } from 'ts-morph'
import { format, organizeImports } from '../../src'
import { expectEqualsAndDiff, expectNoErrors } from '../testUtil'
import { quotes } from '../../src/refactor/quotes'

describe('should organizeImprots', () => {
  it('simple all', () => {
    const project = new Project()
    const code = `
    import f from 'f'
import {v3,g3,s3} from './a'
    import {h3} from 'f'
import    {v2,   g2,s2} from "../../a/b/../../a/b/c"
    import {g3} from 'f'

export a = v2()+s2()+h3()+f()+g3(s3())

import {tt} from './tumba'

const tota = tt
        `.trim()
    const expected = `
import f, { h3 } from 'f'
import { s2, v2 } from '../../a/b/../../a/b/c'
import { g3, s3 } from './a'
import { tt } from './tumba'

export a = v2() + s2() + h3() + f() + g3(s3())


const tota = tt
 `.trim()
    const file = project.createSourceFile('f1.ts', code)
    format({ file, project, quotePreference: 'single', trailingSemicolons: 'never', organizeImports: true })
    expectEqualsAndDiff(file.getFullText().trim(), expected)
  })
})
