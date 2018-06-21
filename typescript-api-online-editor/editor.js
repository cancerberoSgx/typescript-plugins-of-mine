var typeScriptCodeEditor, exampleCodeEditor

const inputValue1 = `class A {
  color: string
  method (a: number, b: Date[][]): Promise<void> {
    return Promise.resolve()
  }
}
const a = new A()
`

const codeExamples = {{{examplesString}}};


function changeExample(name){
  const found = codeExamples.find(e=>e.name===name)
  if(!found){
    alert('Example not found: '+name)
    return 
  }
  example = found
  typeScriptCodeEditor.setValue(example.codeValue)
  exampleCodeEditor.setValue(example.inputValue)
}
let example
function setExampleFromUrlParameter(){
  const exampleIndex = parseInt(new URL(location.href).searchParams.get("example")||'0', 10)||0
  example = codeExamples[exampleIndex]
  if(!example){
    alert('example '+exampleIndex+' not found - showing default example'); example = codeExamples[0]
  }
}
function setWorkingAnimation(working){
  document.getElementById('working-animation').style.display = working ? 'inline-block' : 'none'
}
function typeScriptCodeRun(){
  const body = {input: exampleCodeEditor.getModel().getValue(), code: typeScriptCodeEditor.getModel().getValue()}
  setWorkingAnimation(true)
  fetch('/run', {method: 'post', body: JSON.stringify(body)})
    .then(response=>response.blob())
    .then(blob=>{
      return new Promise(resolve=>{
        const reader = new FileReader() 
        reader.readAsText(blob)
        if(!reader.result && !reader.result.toString()){
          reader.addEventListener("loadend", () => {
            resolve(reader.result.toString())
          })
        }
        else{
          resolve(reader.result.toString())
        }
      })
    })
  .then(responseData=>{
    const {result, text} = formatResult(responseData)
    document.getElementById('result').innerText = text
    if(result.out && result.out.returnValue && example.replaceInputEditorContentWithReturnValue){
      exampleCodeEditor.setValue(result.out.returnValue)
    }
    setWorkingAnimation(false)
  })
  .catch(ex=>{
    alert('Error in the server: ' + ex)
    setWorkingAnimation(false)
  })
}

function formatResult(text){
  const result = JSON.parse(text)
  result.out=JSON.parse(result.out[0])
  
  return {
    result, 
    text: `RETURN VALUE: 
${result.out.returnValue}

STDOUT: 
${result.out.log.join('\n')}

EXIT CODE: 
${result.code}

STDERR: 
${result.err.join('\n')}
`
  }
}

require(["vs/editor/editor.main"], function () {
  
  setExampleFromUrlParameter()
    
  // validation settings
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
  })

  // compiler options
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES6,
      "module": "commonjs",
      "lib": ["es2018"],
      allowNonTsExtensions: true ,
      "strict": false,
    "rootDir": ".",
  /*  "baseUrl": ".", // This must be specified if "paths" is.
    "paths": {
      "ts-simple-ast": ["libs/ts-simple-ast"]
    }*/
  })
  
  
  
  // loading libraries
  {{#each libs}}
  monaco.languages.typescript.typescriptDefaults.addExtraLib.apply(  monaco.languages.typescript.typescriptDefaults, {{{this}}})
  {{/each}}
    
    
  
  const editorOptions = {
    fontSize: '12px',
    language: 'typescript'
  }
  typeScriptCodeEditor = monaco.editor.create(document.getElementById('typeScriptCodeContainer'), Object.assign(editorOptions, {value: example.codeValue}))
    
  exampleCodeEditor = monaco.editor.create(document.getElementById('exampleCodeContainer'), Object.assign(editorOptions, {value: example.inputValue}))
  
})

