import { indent } from 'misc-utils-of-mine-generic'
import { Project, ts } from 'ts-morph'

// function test() {
const p = new Project({
  tsConfigFilePath: 'spec/assets/projectSample1/tsconfig.json',
  addFilesFromTsConfig: true
})
//   // expectNoErrors(p)
const f1 = p.getSourceFileOrThrow('Unit.ts')
//   const f2 = p.getSourceFileOrThrow('Thing.ts')
//   const c = f1.getInterfaceOrThrow('Unit')
//
//   debugger

//   console.log((c.compilerNode! as any).ast)
// }

// test()

const navTree = p.getLanguageService().compilerObject.getNavigationTree(f1.getFilePath())
function print(n: ts.NavigationTree, level = 0) {
  console.log(indent(level), n.text, n.kind, n.kindModifiers)
    ; (n.childItems || []).forEach(c => print(c, level + 1))
}
print(navTree)
// console.log();
