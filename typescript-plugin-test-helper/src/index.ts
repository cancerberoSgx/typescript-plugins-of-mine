
import * as ts from 'typescript'
let languageService:ts.LanguageService
let languageServiceHost : ts.LanguageServiceHost

function main(){
  const tool = create({glob()})
  {languageService, languageServiceHost} = create({tsconfigPath: '...'})
}

class Tool {
  static  create(options: CreateOptions){

    const tool: new Tool(options)
    tool.
  }
  
}

type CreateOptions = {rootFileNames: string[], options: ts.CompilerOptions} // TODO: also support create({tsconfig: 'path/to/tsconfig.json'})
function

tool.createProject({tsconfigPath: '...'})
//or
tool.createProject(rootFileNames: string[], options: ts.CompilerOptions)