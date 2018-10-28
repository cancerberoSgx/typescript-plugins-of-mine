import Program, { Node, SourceFile, ReferenceEntry, Project } from 'ts-simple-ast'

const program = new Program()
const lionFile = program.createSourceFile('src/animal/lion/Lion.ts', `
import {Food} from '../../food/Food'
import {Animal} from '../Animal'
export class Lion extends Animal{
  eat(meat: Food){}
}
`)
const animalFile = program.createSourceFile('src/animal/Animal.ts', `
export class Animal {
  breath(air: number){}
}
`)

const foodFile = program.createSourceFile('src/food/Food.ts', `
import {Animal} from '../animal/Animal'
export class Food {
  energy: number
  canEatBy: Animal[]
}
`)

const Lion = lionFile.getClass('Lion')
const Food = foodFile.getClass('Food')

console.log('ERRORS: '+program.getPreEmitDiagnostics().map(e=>e.getMessageText()+' - '+e.getSourceFile().getFilePath()).join('\n'))

moveNode(Food, animalFile)

console.log(lionFile.getText());

function moveNode(node: Node, dest: SourceFile) {
  const references = getReferences(node)
  const thisFile = node.getSourceFile()
  const thisFileImports = thisFile.getImportDeclarations()

  const referencedSourceFiles = references.map(r => r.getSourceFile()).filter((f, i, a) => a.indexOf(f) === i && f !== thisFile)
  referencedSourceFiles.forEach(f => {
    f.addImportDeclaration({ defaultImport: undefined,
      moduleSpecifier: '../animal/Animal',
      namedImports: [ { name: 'Animal', alias: undefined } ],
      namespaceImport: undefined })
    f.addImportDeclarations(thisFileImports.map(i => {
      console.log(i.getStructure());
      
      return {
        ...i.getStructure(), 
        // moduleSpecifier: dest.getRelativePathAsModuleSpecifierTo( i.getSourceFile())
      }
    }))
    f.organizeImports()
  })
  // referencedSourceFiles.forEach(f => {
  //   console.log(f.getFilePath());
  // })

  // const referencedImports = references.map(r => r.getNode().getSourceFile()).filter((f, i, a) => a.indexOf(f) === i && f !== thisFile)


}
// console.log(Lion.getText());

function getReferences(node: Node): ReferenceEntry[] {
  const references: ReferenceEntry[] = []
  const referencedSymbols = Food.findReferences();
  for (const referencedSymbol of referencedSymbols) {
    for (const reference of referencedSymbol.getReferences()) {
      references.push(reference)
    }
  }
  return references
}


