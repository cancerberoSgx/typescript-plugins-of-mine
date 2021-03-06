import { ContentFile, RemoteFile, run } from '..'
import { printMs } from 'misc-utils-of-mine-generic'

async function test() {
  let result = await run({
    tsLibBaseUrl: `${location.href}libs/`,
    targetFile: new ContentFile(
      'test1.ts',
      `
      console.log('hello there!')
      export function f() { return 'hello' }`
    ),
    tsConfigJson: new RemoteFile(`${location.href}test/tsconfig.json`)
  })
  console.log(printMs(result.totalTime), 'exported: ', result.exported.f())

  const result2 = await run({
    targetFile: new ContentFile(
      'test2.ts',
      `
      import {a} from './test3'; 
      console.log('imported: ' + a)
      export const c = 'exported: '+a
      `
    ),
    files: [
      new ContentFile(
        'test3.ts',
        `
        export const a = 'hello world'
        `
      )
    ],
    project: result.project
  })
  console.log(printMs(result2.totalTime), 'exported: ', result2.exported.c)

  result = await run({
    tsLibBaseUrl: `${location.href}libs/`,
    targetFile: new ContentFile(
      'src/test.ts',
      `
      import { a } from './foo/foo'; 
      export function test() {
        return a * 2
      }`
    ),
    files: [
      new ContentFile(
        'src/foo/foo.ts',
        `
        export const a = Math.PI`
      )
    ],
    tsConfigJson: new RemoteFile(`${location.href}test/tsconfig.json`)
  })
  console.log(
    'Time: ',
    printMs(result.totalTime),
    '\nExported: ',
    result.exported.test(),
    'Errors: \n',
    result.errors,
    '\nEmitted: \n',
    result.emitted
  )
}

test()
