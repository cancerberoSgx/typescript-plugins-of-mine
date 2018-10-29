import { Node, SourceFile, ReferenceEntry, Project, ClassDeclaration, TypeGuards } from 'ts-simple-ast'
import { ok, equal } from 'assert';

const project = new Project({ useVirtualFileSystem: true })

const lionFile = project.createSourceFile('src/animal/lion/Lion.ts', `
import {Food} from '../../food/Food'
import {Animal} from '../Animal'
export class Lion extends Animal{
  eat(meat: Food){}
}
`)
const animalFile = project.createSourceFile('src/animal/Animal.ts', `
export class Animal {
  breath(air: number){}
}
`)
const energyFile = project.createSourceFile('src/energy/Energy.ts', `
export class Energy {
  burn(): number {return 1}
}
`)

const foodFile = project.createSourceFile('src/food/Food.ts', `
import {Animal} from '../animal/Animal'
import {Energy} from '../energy/Energy'
export class Food {
  energy: Energy
  canEatBy: Animal[]
}
`)

const Food = foodFile.getClass('Food')
const tmpFile = project.createSourceFile('tmp.ts', '')

// console.log('ERRORS: '+project.getPreEmitDiagnostics().map(e=>e.getMessageText()+' - '+(e.getSourceFile() && e.getSourceFile().getFilePath())).join('\n'))

moveNode(Food, animalFile)
// console.log(printSourceFile(lionFile));


equal(printSourceFile(foodFile), '')
equal(printSourceFile(animalFile), 'import { Energy } from "../energy/Energy"; export class Animal { breath(air: number){} } export class Food { energy: Energy; canEatBy: Animal[]; }')
equal(printSourceFile(lionFile), `import {Animal} from '../Animal' import { Food } from "../animal/Animal"; export class Lion extends Animal{ eat(meat: Food){} }`)

function moveNode(node: ClassDeclaration, dest: SourceFile) {

  const thisFile = node.getSourceFile()

  const references = getReferences(node)
  const thisFileImports = thisFile.getImportDeclarations()

  // we copy all the imports from nodeFile to destFile and the organize imports so the moved declaration don't miss any import
  // TODO: class declaration maybe using references to nodes inside destFile non exported or imported
  dest.addImportDeclarations(thisFileImports.filter(i => i.getModuleSpecifierSourceFile() !== dest).map(i => {
    return {
      ...i.getStructure(),
      moduleSpecifier: i.getSourceFile().getRelativePathAsModuleSpecifierTo(i.getModuleSpecifierSourceFile())
    }
  })
  )
  // For each referenced sourceFile  - each import that references the nodeFile we duplicate them fixing the target path to dest.
  const referencedSourceFiles = references.map(r => r.getSourceFile()).filter((f, i, a) => a.indexOf(f) === i && f !== thisFile)
  referencedSourceFiles.forEach(f => {
    const newImports = f.getImportDeclarations().filter(i => i.getModuleSpecifierSourceFile() === thisFile).map(i =>
      ({
        ...i.getStructure(),
        moduleSpecifier: i.getModuleSpecifierSourceFile().getRelativePathAsModuleSpecifierTo(dest)
      })
    )
    f.addImportDeclarations(newImports)
    f.getImportDeclarations().filter(i => i.getModuleSpecifierSourceFile() === thisFile).forEach(i => i.remove())
  })

  // move the declaration
  dest.addClass(node.getStructure())
  node.remove();
  dest.organizeImports()
  thisFile.organizeImports()

  // // call orgnizeImports for referenced sourceFiles - now that we moved the declaration - since we it must work now that they have the new fixed imports - will remove the old ones 
  // referencedSourceFiles.forEach(f => {
  //   // heads up - workaround for organizeImports issue
  //   tmpFile.replaceWithText(f.getText())
  //   tmpFile.organizeImports()
  //   f.replaceWithText(tmpFile.getText())
  // })

}

function printSourceFile(sf: SourceFile) {
  return sf.getText().trim().replace(/[\s]+/gm, ' ')
}

function getReferences(node: ClassDeclaration): ReferenceEntry[] {
  const references: ReferenceEntry[] = []
  const referencedSymbols = node.findReferences();
  for (const referencedSymbol of referencedSymbols) {
    for (const reference of referencedSymbol.getReferences()) {
      references.push(reference)
    }
  }
  return references
}


