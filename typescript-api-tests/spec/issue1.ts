
import Project from 'ts-simple-ast'
import * as ts from 'typescript'
const project = new Project({
    compilerOptions: {
        target: ts.ScriptTarget.ES3
    }
});
const fileText = "enum MyEnum {\n}\n";
const sourceFile = project.createSourceFile("/home/sg/git/typescript-plugins-of-mine/typescript-api-tests/assets/sampleProject1_1_copy/test11.ts", `function(){
  
}
var i = 1
`);
const i = sourceFile.getAncestors().find(a => a.getText() === 'i');
console.log(i.getStart(), i.getEnd());
//# sourceMappingURL=issue1.js.map