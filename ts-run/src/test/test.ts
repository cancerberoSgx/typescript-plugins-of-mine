import { run } from '../run'
import { ContentFile, RemoteFile } from '../file'

async function test() {
  const result = await run({
    tsLibBaseUrl: `${location.href}libs/`,
    targetFile: new ContentFile('test1.ts', "console.log('test123123')"),
    files: [],
    tsConfigJson: new RemoteFile(`${location.href}test/tsconfig.json`)
  })
  console.log(result.totalTime)

  const result2 = await run({
    // tsLibBaseUrl: `${location.href}libs/`,
    targetFile: new ContentFile('test2.ts', `import {a} from './test3'; console.log('imported: ' + a)`),
    files: [new ContentFile('test3.ts', `export const a = 'hello world'`)],
    // tsConfigJson: new RemoteFile(`${location.href}test/tsconfig.json`),
    project: result.project
  })
  console.log(result2.totalTime)
}

test()
