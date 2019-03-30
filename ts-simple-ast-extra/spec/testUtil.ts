import Project from 'ts-morph';

export function createProject(...args: string[]) {
  const project = new Project();
  const f1 = project.createSourceFile('f1.ts', args[0] || '');
  const f2 = project.createSourceFile('f2.ts', args[1] || '');
  const f3 = project.createSourceFile('f3.ts', args[2] || '');
  expectNoErrors(project);
  return { project, f1, f2, f3 };
}

export function expectNoErrors(project: Project) {
  expect(project.getPreEmitDiagnostics().map(d => d.getMessageText()).join(', ')).toBe('');
}
