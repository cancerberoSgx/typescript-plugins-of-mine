import {Project} from 'ts-morph'

const project = new Project()

const lionFile = project.createSourceFile('src/animal/lion/Lion.ts', `
import {Food} from '../../food/Food' // <<<----- if this import is changed to point to something else then error dones't happen
/* import {Animal} from '../Animal'  <<<<<---- if I remove this line, even if it's commented as it is the error doesn't happen */
export class Lion {
  eat(meat: Food){}
}
`)

const foodFile = project.createSourceFile('src/food/Food.ts', `
export class Food {
  energy: number
  canEatBy: number[]
}
`)

const Food = foodFile.getClass('Food')

console.log('ERRORS: ' + project.getPreEmitDiagnostics().map(e => e.getMessageText() + ' - ' + e.getSourceFile().getFilePath()).join('\n'))

Food.findReferences(); // If i comment this call the error doesn't happen 

lionFile.addImportDeclaration({ // it doesn't matter if the import points to something that exists or not
  moduleSpecifier: '../foo',
  namedImports: [{ name: 'Foo'}]
})  
lionFile.organizeImports()
console.log(lionFile.getText());

