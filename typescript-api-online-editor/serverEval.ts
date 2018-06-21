function fn(request, response, readFileSync2){
 
  const readFileSync = require('fs').readFileSync
  
  
  const templates = compileTemplates()
  const templatesContext = getTemplatesContext()
  
  if(request.url==='/editor.js'){
    const result = templates.editorJs(templatesContext)
    response.writeHead(200, {"Content-Type": "text/javascript"})
    response.write(result)
    response.end()
  }
  else if(request.url==='/run'){
    let body = ''
    request.on('data', function(chunk) {
      body += chunk.toString()
    });
    request.on('end', function() {
      const {code, input} = JSON.parse(body)
      runTs(code, input).then(result=>{
        response.writeHead(200, "OK", {'Content-Type': 'text/text'});
        response.write(JSON.stringify(result))
        response.end();
      })
      
    });
  }
  else{
    response.writeHead(200, {"Content-Type": "text/html"})
    const result = templates.indexHtml(templatesContext)
    response.write(result)
    response.end()
  }
  
  
  
  
function runTs(code, input){
  return new Promise(resolve=>{
    let s = `
    const __logBuffer = []
    const __log = (m)=>__logBuffer.push(m)
    const __input = \`${input.replace(/`/gm, '\\`')}\`;
    ${code}
    const __result = {returnValue: main(__input, __log), log: __logBuffer}
    console.log(JSON.stringify(__result))
    `
    const tsNode = require('child_process').spawn('node', ['node_modules/ts-node/dist/bin', '--project', './tsconfig.json'])
    tsNode.stdin.write(s);
    tsNode.stdin.end()
    const status = {
      out: [], 
      err: [],
      code: 0
    }
    tsNode.stdout.on('data', (data) => {
      status.out.push(data.toString())
    });

    tsNode.stderr.on('data', (data) => {
      status.err.push(data.toString())
    });

    tsNode.on('close', (code) => {
      status.code = code
      resolve(status)
    });
  })
}
  

  function compileTemplates(){
  const handlebars = require('handlebars')
    return {
      editorJs: handlebars.compile(readFileSync('./editor.js').toString()), 
      indexHtml: handlebars.compile(readFileSync('./index.html').toString())
    }    
  }
  function getTemplatesContext(){
    const libs = ['typescript.d.ts', /*'ts-simple-ast.d.ts', */'node.d.ts']
    const examples = getExamples()
    return {
      libs: libs.map(l=>JSON.stringify([readFileSync(`./assets/${l}`).toString(), `libs/${l}`])), 
      examples, examplesString: JSON.stringify(examples)
    }
  }
  
 function getExamples(){
   const inputValue1 = `class A {
  color: string
  method (a: number, b: Date[][]): Promise<void> {
    return Promise.resolve()
  }
}
const a = new A()
`

const codeExamples = [
  {
    name: 'TypeScript scanner', 
    description: 'Not very useful but shows Scanned API. Taken from <a href="https://basarat.gitbooks.io/typescript/content/docs/compiler/scanner.html">TypeScript book</a>', 
    inputValue: inputValue1,
    codeValue: `import * as ts from 'typescript'

// export a function main like this and the code at the right will be passed as parameter
export function main(code:string, log: (msg:string)=>void) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest,  true)
  scanner.setText(code)
  scanner.setOnError((message: ts.DiagnosticMessage, length: number) => {
    log('Error: '+message);
  })
  scanner.setScriptTarget(ts.ScriptTarget.ES5);
  scanner.setLanguageVariant(ts.LanguageVariant.Standard)

  let token = scanner.scan()
  while (token != ts.SyntaxKind.EndOfFileToken) {
    log( getKindName(token))
    token = scanner.scan()
  }
  return 'see the logs'
}

function getKindName(kind: ts.SyntaxKind) {
  return (ts as any).SyntaxKind[kind];
} 
`
  }, 
  
  
  
  {
    name: 'Simple Transformation', 
    description: 'Using TypeScript transformation API we change all property access expression like "foo.bar" so when "bar" has the name "accessorToBeRemoved" we leave only "foo". See how the example code changes after run it', 
    replaceInputEditorContentWithReturnValue: true,
    inputValue: `const foo = {
  method1(s: any){}, 
  accessorToBeRemoved: 'red', 
  otherProperty: [true]
}
foo.method1(foo.otherProperty)
foo.method1(foo.accessorToBeRemoved)
foo.otherProperty = null
foo.accessorToBeRemoved = null
`,
    
    codeValue: `import * as ts from 'typescript'
function main(source: string, log: (msg:string)=>void){
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    'test.ts', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
  );
  const printer: ts.Printer = ts.createPrinter();
  const result: ts.TransformationResult<ts.SourceFile> = ts.transform<ts.SourceFile>(
    sourceFile, [transformer]
  );
  const transformedSourceFile: ts.SourceFile = result.transformed[0];
  const newContent = printer.printFile(transformedSourceFile)
  result.dispose()
  return newContent
}
const transformer = <T extends ts.Node>(context: ts.TransformationContext) => {
  return (rootNode: T) => {
    function visit(node: ts.Node): ts.Node {
      node = ts.visitEachChild(node, visit, context);
      // in a property access expression like "foo.bar" "foo" is the expression and "bar" is the name : 
      // we replace the whole expression with just node.expression in the case name is "accessorToBeRemoved"
      if (ts.isPropertyAccessExpression(node) && node.name &&
        node.name.getText() === 'accessorToBeRemoved') {
        return node.expression
      }
      return node;
    }
    return ts.visitNode(rootNode, visit);
  }
}
`
  },
  
  {
    name: 'Transformation 2', 
    description: 'More complex example of using TypeScript Transformation API. See comments in the code for details. Heads up, the example sources changes after run completes.',
    replaceInputEditorContentWithReturnValue: true,
    inputValue: `class Foo {
  magic2(s: number) {
    return s + 5 + 50 + 11 + 99 * 8 * 7 / s
  }
}
const value = new Foo().magic2(1 + 2 + 3)`,
    
    codeValue: `// this example will create a simple typescript source file programmatically, parse it to AST Nodes and then 
// use TypeScript Transformations to manipulate some ot its nodes (changing  particular arithmetic expressions). 
// Finally , the transformed AST will be printed back to another source file as a string

// (Note: I've taken this example from somewhere else some credits are not mine - but since there's limited typescript 
// documentation I think is a good idea to duplicate this... )

import * as ts from 'typescript'

export function main(source: string, log: (msg: string) => void): string {

  const sourceFile: ts.SourceFile = ts.createSourceFile(
    'test.ts', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
  )

  // Apply transformation to the sourcefile 
  const result: ts.TransformationResult<ts.SourceFile> = ts.transform<ts.SourceFile>(
    sourceFile, [transformer]
  )
  // obtain the transformed source file
  const transformedSourceFile: ts.SourceFile = result.transformed[0]
  const printer: ts.Printer = ts.createPrinter()

  const transformedContent = printer.printFile(transformedSourceFile)

  log('Original file:\\n' + printer.printFile(sourceFile) + 'Transformed file:\\n' + transformedContent)

  result.dispose()
  return transformedContent
}

// Now the interesting part, we will build a Transformation that will replace particular nodes of 
// the AST, BinaryExpressions like a+b, and replace them with with the number literal resulting 
// of applying the mathematical operation. In this case the expression "1 + 1 + 3" will be replaced 
// with the expression "6"
const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {

  // visit() function will visit all the descendants node (recursively)  
  function visit(node: ts.Node): ts.Node {
    node = ts.visitEachChild(node, visit, context)

    // Here we filter which node we want to manipulate / replace, in our case binary expressions
    if (ts.isBinaryExpression(node)) {

      if (node.left.kind === ts.SyntaxKind.NumericLiteral &&
        node.right.kind === ts.SyntaxKind.NumericLiteral) {
        const left = node.left as ts.NumericLiteral
        const leftVal = parseFloat(left.text)
        const right = node.right as ts.NumericLiteral
        const rightVal = parseFloat(right.text)
        switch (node.operatorToken.kind) {
          case ts.SyntaxKind.PlusToken:

            // Important, returning another node will replace the original "node" with returned one. 
            // In our case we will be replacing binary expressions like 1.2 with the actual result of 
            // the operaton (as long as operands are literals)
            return ts.createLiteral(leftVal + rightVal)
          case ts.SyntaxKind.AsteriskToken:
            return ts.createLiteral(leftVal * rightVal)
          case ts.SyntaxKind.MinusToken:
            return ts.createLiteral(leftVal - rightVal)
        }
      }
    }
    // for all the other kind of nodes, we just return the node (no transformation or replacement)
    return node
  }
  return ts.visitNode(rootNode, visit)
}
`
  }, 
  
  {
  
    name: 'Transformation 3', 
    description: 'Another Transformation API example that will add new nodes, this time putting a name to functions declared without name',
    replaceInputEditorContentWithReturnValue: true,
    inputValue:`function(a: number):[number]{
    return [Math.PI*a/2]
}
function named(b:string){
    function():string {return ''}
    return 123
}
const alsoWithName = function(){
    return function(){} // let's see what happens with this one
}; 
(function (a: number) { return a + 1; })(5); // and with this one
`,
  codeValue: `import * as ts from 'typescript';

// since having function declarations without name is an error in TypeScript this transformation will put them name

function main(source: string, log: (m: string)=>void):string {
  let nameCounter = 0
  const transformFactory = (context: ts.TransformationContext) => (rootNode: ts.SourceFile): ts.SourceFile => {
    const visit = (node: ts.Node) => {
      node = ts.visitEachChild(node, visit, context);
      if (ts.isFunctionDeclaration(node) && (!node.name || !node.name.escapedText)) {
        // we can actually change the node using two techniques, the first one is creating a new mutable 
        // clone and modify it and return it
        const clone = ts.getMutableClone(node)
        clone.name = ts.createIdentifier('unnamedFunc'+nameCounter++)
        return clone
        
        // or also we could create a new node using the ts.create* functions : 

        // return ts.createFunctionDeclaration(node.decorators, node.modifiers, node.asteriskToken,
        //   ts.createIdentifier('unnamedFunc'), node.typeParameters, node.parameters, node.type, node.body)
      }
      return node
    }
    return ts.visitNode(rootNode, visit)
  }

  const sourceFile = ts.createSourceFile(
    'test.ts', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
  )
  const result = ts.transform(sourceFile, [transformFactory])
  const transformedContent = ts.createPrinter().printFile(result.transformed[0])
  log('Nodes changed : '+nameCounter)
  return transformedContent
}
`
  },
  
  {
  
  name: 'Build and print AST programatically' , 
    description: 'Using TypeScript Compiler API to build an AST programaticay and printing the result out, in this case a working factorial function, taken from <a href="https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#user-content-creating-and-printing-a-typescript-ast">TypeScript Compiler API docs</a>',
    replaceInputEditorContentWithReturnValue: true,
    inputValue:``,
    codeValue: `import * as ts from 'typescript';

function makeFactorialFunction() {
  const functionName = ts.createIdentifier("factorial");
  const paramName = ts.createIdentifier("n");
  const parameter = ts.createParameter(
      /*decorators*/ undefined,
      /*modifiers*/ undefined,
      /*dotDotDotToken*/ undefined,
      paramName);

  const condition = ts.createBinary(
      paramName,
      ts.SyntaxKind.LessThanEqualsToken,
      ts.createLiteral(1));

  const ifBody = ts.createBlock(
      [ts.createReturn(ts.createLiteral(1))],
      /*multiline*/ true)
  const decrementedArg = ts.createBinary(paramName, ts.SyntaxKind.MinusToken, ts.createLiteral(1))
  const recurse = ts.createBinary(
      paramName,
      ts.SyntaxKind.AsteriskToken,
      ts.createCall(functionName, /*typeArgs*/undefined, [decrementedArg]));
  const statements = [
      ts.createIf(condition, ifBody),
      ts.createReturn(
          recurse
      ),
  ];
  return ts.createFunctionDeclaration(
      /*decorators*/ undefined,
      /*modifiers*/[ts.createToken(ts.SyntaxKind.ExportKeyword)],
      /*asteriskToken*/ undefined,
      functionName,
      /*typeParameters*/ undefined,
      [parameter],
      /*returnType*/ ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
      ts.createBlock(statements, /*multiline*/ true),
  )
}

function main(source: string, log: (m: string)=>void):string {
  const resultFile = ts.createSourceFile("someFileName.ts", "", ts.ScriptTarget.Latest, /*setParentNodes*/ false, ts.ScriptKind.TS);
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });
  const result = printer.printNode(ts.EmitHint.Unspecified, makeFactorialFunction(), resultFile);
  return result
}`
  }, 
  
  
  {
  
  name: 'Transpiling-a-single-file' , 
    description: 'Using TypeScript Compiler API To transpile a single file to JavaScript. Tken from <a href="https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#transpiling-a-single-file">TypeScript Compiler API docs</a>',
    replaceInputEditorContentWithReturnValue: true,
    inputValue:`import {foo} from 'foo'

export const f = (obj: {d: boolean}): {a: number, b: Date, d:boolean} => {
  for(let d of [new Date()]){
    foo(d)
  }
  return {a: 1, b: new Date(), ... obj}
}`,
    codeValue: `import * as ts from 'typescript';

function main(source: string, log: (m: string) => void): string {
  var compilerOptions = { module: ts.ModuleKind.System };
  var res1 = ts.transpileModule(source, { compilerOptions: compilerOptions, moduleName: "myModule2" });
  log(res1.outputText);
  log("============")
  var res2 = ts.transpile(source, compilerOptions, /*fileName*/ undefined, /*diagnostics*/ undefined, /*moduleName*/ "myModule1");
  log(res2);
  return res2
}`
  }





]




 return codeExamples
 } 



}




