const a = 2 + 3
function bigfish()                            { return 1 }
const bigger = f()
var hoo = ['asd']
const cece = a + bigfish()
let arr = ['s', 't']
function x() { return arr && arr.length ? arr : [1, 28276382736827368472364, 3] }

interface Person{}
interface Shoe{
  wear(p: Person):void
}
class Shoe {
  color = 123
}

/***@ 

// For evaluating code you can use a comment with a format like this one, (see how starts with "/*** followed by "at")
// You could have many of these comments as this one as long they contain VALID JAVASCRIPT 
// (this is why we use line comments inside for this internal comments)
// You will have a "c" context object with properties (TODO link to API docs): 

// ts: typeof ts                             whole typescript namespace available
// sts: typeof sts                           whole ts-simple-ast namespace available
// node: Node                                node selected by user when activated this refactor
// print(s): void                            print text back here a analog to console.log !
// printAst (node:Node|ts.Node): string      pretty structure of given node's AST to understand it !

c.print(`
Hello from editor! 
using typescript library version: ${c.ts.version}
Selected node by user is a ${c.node.getKindName()} with text "${c.node.getText()}"
The AST structure of this file:  
${c.printAst(c.node.getSourceFile())}
`)

@***/
/*######################
Output:

Hello from editor! 
using typescript library version: 2.8.3
Selected node by user is a Identifier with text "Shoe"
The AST structure of this file:  
#0 SourceFile : "const a = 2 + 3 function bigfish() { return 1 } const bigger"
#0 VariableStatement : "const a = 2 + 3"
  #0 VariableDeclarationList : "const a = 2 + 3"
    #0 VariableDeclaration : "a = 2 + 3"
      #0 a Identifier : "a"
      #1 BinaryExpression : "2 + 3"
        #0 NumericLiteral : "2"
        #1 PlusToken : "+"
        #2 NumericLiteral : "3"
#1 FunctionDeclaration : "function bigfish() { return 1 }"
  #0 bigfish Identifier : "bigfish"
  #1 Block : "{ return 1 }"
    #0 ReturnStatement : "return 1"
      #0 NumericLiteral : "1"
#2 VariableStatement : "const bigger = f()"
  #0 VariableDeclarationList : "const bigger = f()"
    #0 VariableDeclaration : "bigger = f()"
      #0 bigger Identifier : "bigger"
      #1 CallExpression : "f()"
        #0 f Identifier : "f"
#3 VariableStatement : "var hoo = ['asd']"
  #0 VariableDeclarationList : "var hoo = ['asd']"
    #0 VariableDeclaration : "hoo = ['asd']"
      #0 hoo Identifier : "hoo"
      #1 ArrayLiteralExpression : "['asd']"
        #0 StringLiteral : "'asd'"
#4 VariableStatement : "const cece = a + bigfish()"
  #0 VariableDeclarationList : "const cece = a + bigfish()"
    #0 VariableDeclaration : "cece = a + bigfish()"
      #0 cece Identifier : "cece"
      #1 BinaryExpression : "a + bigfish()"
        #0 a Identifier : "a"
        #1 PlusToken : "+"
        #2 CallExpression : "bigfish()"
          #0 bigfish Identifier : "bigfish"
#5 VariableStatement : "let arr = ['s', 't']"
  #0 VariableDeclarationList : "let arr = ['s', 't']"
    #0 VariableDeclaration : "arr = ['s', 't']"
      #0 arr Identifier : "arr"
      #1 ArrayLiteralExpression : "['s', 't']"
        #0 StringLiteral : "'s'"
        #1 StringLiteral : "'t'"
#6 FunctionDeclaration : "function x() { return arr && arr.length ? arr : [1, 28276382"
  #0 x Identifier : "x"
  #1 Block : "{ return arr && arr.length ? arr : [1, 282763827368273684723"
    #0 ReturnStatement : "return arr && arr.length ? arr : [1, 28276382736827368472364"
      #0 ConditionalExpression : "arr && arr.length ? arr : [1, 28276382736827368472364, 3]"
        #0 BinaryExpression : "arr && arr.length"
          #0 arr Identifier : "arr"
          #1 AmpersandAmpersandToken : "&&"
          #2 PropertyAccessExpression : "arr.length"
            #0 arr Identifier : "arr"
            #1 length Identifier : "length"
        #1 QuestionToken : "?"
        #2 arr Identifier : "arr"
        #3 ColonToken : ":"
        #4 ArrayLiteralExpression : "[1, 28276382736827368472364, 3]"
          #0 NumericLiteral : "1"
          #1 NumericLiteral : "28276382736827368472364"
          #2 NumericLiteral : "3"
#7 InterfaceDeclaration : "interface Person{}"
  #0 Person Identifier : "Person"
#8 InterfaceDeclaration : "interface Shoe{ wear(p: Person):void }"
  #0 Shoe Identifier : "Shoe"
  #1 MethodSignature : "wear(p: Person):void"
    #0 wear Identifier : "wear"
    #1 Parameter : "p: Person"
      #0 p Identifier : "p"
      #1 TypeReference : "Person"
        #0 Person Identifier : "Person"
    #2 VoidKeyword : "void"
#9 ClassDeclaration : "class Shoe { color = 123 }"
  #0 Shoe Identifier : "Shoe"
  #1 PropertyDeclaration : "color = 123"
    #0 color Identifier : "color"
    #1 NumericLiteral : "123"
#10 EndOfFileToken : ""


##########################*/
      