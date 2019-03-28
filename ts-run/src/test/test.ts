import { run } from "../run";
import { ContentFile, RemoteFile } from '../file';

async function test(){
  const result = await run({
    tsLibBaseUrl: `${location.href}libs/`,
    targetFile: new ContentFile( 'test1.ts','console.log(\'test123123\')'),
    files: [],
    tsConfigJson: new RemoteFile(`${location.href}test/tsconfig.json`)
  })
  console.log(result);  
}

test( )