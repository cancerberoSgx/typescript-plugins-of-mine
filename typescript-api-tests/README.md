
code gen ideas

first : get the diagnossis errors corresponding to the current line


stst = fn.getBody().getDescendantStatements()   // error: {
	"resource": "/home/sg/git/typescript-plugins-of-mine/typescript-api-tests/spec/codeGenSpec.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'stst'.",
	"source": "ts",
	"startLineNumber": 23,
	"startColumn": 5,
	"endLineNumber": 23,
	"endColumn": 9
}

fix: declare const , let, var 

