import { ContentFile, RemoteFile, run } from '..'
import { printMs } from 'misc-utils-of-mine-generic'
import { resolve } from 'path'
describe('node', () => {
  it('research', async () => {
    expect(1).toBe(1)
    // const result = await run({
    //   tsLibBaseUrl: `file://${resolve('node_modules/typescript/lib')}/`,
    //   targetFile: new ContentFile('test1.ts', `
    //     console.log('hello there!')
    //     export function f() { return 'hello' }
    //   `),
    //   tsConfigJson: new RemoteFile(`${location.href}test/tsconfig.json`)
    // })
    // console.log(printMs(result.totalTime), 'exported: ', result.exported.c)
  })
})
