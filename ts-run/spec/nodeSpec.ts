import { ContentFile, RemoteFile, run } from '../src'
import { resolve } from 'path';
describe('node', () => {
  it('research', async () => {
    expect(1).toBe(1)
    const result = await run({
      tsLibBaseUrl: `file://${resolve('node_modules/typescript/lib')}/`,
      targetFile: new ContentFile('test1.ts', `
        console.log('hello there!')
        export function f() { return 'hello' }
      `),
      tsConfigJson: new RemoteFile(`file://${resolve('tsconfig.json')}`)
    })
    expect(result.exported.f()).toBe('hello')
    const result2 = await run({
      targetFile: new ContentFile('test2.ts', `
        import {a} from './test3'; 
        console.log('imported: ' + a)
        export const c = 'exported: '+a
      `),
      files: [new ContentFile('test3.ts', `
        export const a = 'hello world'
      `)],
      project: result.project
    })
    expect(result2.exported.c).toBe('exported: hello world')
  })
})  
