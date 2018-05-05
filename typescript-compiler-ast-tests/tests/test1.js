// import ts, { CompilerHost } from 'typescript'


const ts = require('typescript')

function  generateAST  (code, options, additionalParsingContext) {

  const compilerHost = {
    fileExists() {
        return true;
    },
    getCanonicalFileName() {
        return file;
    },
    getCurrentDirectory() {
        return "";
    },
    getDefaultLibFileName() {
        return "lib.d.ts";
    },

    // TODO: Support Windows CRLF
    getNewLine() {
        return "\n";
    },

    getSourceFile(filename) {
        return ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true);
    },
    readFile() {
        return null;
    },
    useCaseSensitiveFileNames() {
        return true;
    },
    writeFile() {
        return null;
    }
  };

  const program = ts.createProgram([file], {
    target: ts.ScriptTarget.Latest}, compilerHost);

  const ast = program.getSourceFile(file);
  return ast
  }


const fs = require('fs')

const file = './tests/assets/file1.ts'
const code = fs.readFileSync(file).toString()

const ast = generateAST(code, {}, {})
console.log(ast)