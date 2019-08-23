import { Project } from 'ts-morph'
import { emptyLines, convertParamsToDestructuredObject } from '../../src'
import { expectEqualsAndDiff, expectNoErrors } from '../testUtil'

describe('convertParamsToDestructuredObject', () => {
            it("should convert a function declaration's parameters", () => {

              const project = new Project()
    const code = `
function f(a: number, b: string[]) { }; 
export const a = f(1, ['1']);
    `.trim()
    const expected = `
function f({ a, b }: { a: number; b: string[]; }) { }; 
export const a = f({ a: 1, b: ['1'] });
`.trim()
    const file = project.createSourceFile('f1.ts', code)
    expectNoErrors(project)
    convertParamsToDestructuredObject({ file, project , node: file.getFunctionOrThrow(('f'))})
    expectEqualsAndDiff(file.getFullText().trim(), expected)
    expectNoErrors(project)
            });

//             it("should not convert class' methods overriding", () => {
//                 const { sourceFile } = getInfoFromText<FunctionDeclaration>(`
// interface I {
//     m(a: Date[], b: boolean, c?: string, d?: number[][]): void
// }
// class C implements I {
//     m(a: Date[], b: boolean, c?: string, d?: number[][]) { }
//     n(a: Date[], b: boolean, c?: string, d?: number[][]) { }
// }`);
//                 sourceFile.getClassOrThrow("C").getMethods().forEach(m => m.convertParamsToDestructuredObject());
//                 expect(sourceFile.getText().trim()).to.equal(`
// interface I {
//     m(a: Date[], b: boolean, c?: string, d?: number[][]): void
// }
// class C implements I {
//     m(a: Date[], b: boolean, c?: string, d?: number[][]) { }
//     n({ a, b, c, d }: { a: Date[]; b: boolean; c?: string; d?: number[][]; }) { }
// }`.trim());
//             });

//                 it("should refactor all files", () => {
//                     const { sourceFile, project
//                     } = getInfoFromText<FunctionDeclaration>("export function f(a: number, b: string[]) { }", { filePath: "f.ts", includeLibDts: true });
//                     const sourceFile2 = project.createSourceFile("a.ts", `import {f} from './f'; f(1, ["b"]);`);
//                     expect(project.getPreEmitDiagnostics().map(d => d.getMessageText())).to.deep.equal([]);
//                     sourceFile.getFunctionOrThrow("f").convertParamsToDestructuredObject();
//                     expect(sourceFile.getText()).to.equal(`export function f({ a, b }: { a: number; b: string[]; }) { }`);
//                     expect(sourceFile2.getText()).to.equal(`import {f} from './f'; f({ a: 1, b: ["b"] });`);
//                 });
})
