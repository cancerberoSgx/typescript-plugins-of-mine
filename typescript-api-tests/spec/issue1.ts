
import Project from 'ts-simple-ast'
import * as ts from 'typescript'
import { rm } from 'shelljs';
const project = new Project({
    compilerOptions: {
        target: ts.ScriptTarget.ES3
    }
});
const fileText = "enum MyEnum {\n}\n";
const filePath = "assets/sampleProject1_1_copy/test11.ts"
rm('-rf', filePath)
let sourceFile = project.createSourceFile(filePath, `export function f (){
  
}
i = 1
`);

sourceFile.saveSync()
project.saveSync()
project.emit()
sourceFile = project.getSourceFile(filePath)
const i = sourceFile.getDescendants().find(a => a.getText() === 'i');
console.log(i.getStart(), i.getEnd());