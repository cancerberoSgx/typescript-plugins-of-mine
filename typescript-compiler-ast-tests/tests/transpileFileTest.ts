var ts = require("typescript");
var content =
    "import {f} from \"foo\"\n" +
    "export var x = f()";

var compilerOptions = { module: ts.ModuleKind.System };

var res1 = ts.transpileModule(content, {compilerOptions: compilerOptions, moduleName: "myModule2"});
console.log(res1.outputText);

console.log("============")

var res2 = ts.transpile(content, compilerOptions, /*fileName*/ undefined, /*diagnostics*/ undefined, /*moduleName*/ "myModule1");
console.log(res2);