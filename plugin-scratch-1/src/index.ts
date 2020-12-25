import { ScriptElementKind } from "typescript";
import { findDescendantInPosition, log, printNode, toRange } from "./util";

function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
  const ts = modules.typescript;

  function create(info: ts.server.PluginCreateInfo) {
    // const whatToRemove: string[] = info.config.remove || ["caller"];

    // Diagnostic logging
    info.project.projectService.logger.info(
      "I'm getting set up now! Check the log for this message."
    );

    // Set up decorator
    const proxy: ts.LanguageService = Object.create(null);
    for (let k of Object.keys(info.languageService) as Array<
      keyof ts.LanguageService
    >) {
      const x = info.languageService[k];
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    // Remove specified entries from completion list
    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      try {
        const prior = info.languageService.getCompletionsAtPosition(fileName, position, options) || { entries: [] } as any;
        const program = info.languageService.getProgram()!;
        const file = program.getSourceFile(fileName)!;
        log(printNode(findDescendantInPosition(file, position)))
        prior.entries.push({ "name": "seba", kind: ScriptElementKind.functionElement, "kindModifiers": "", "sortText": "5" })
        return prior;
      }
      catch (error) {
        log('ERROR')
        log(error.toString())
        log(error.stack)
      }
    }

    proxy.getApplicableRefactors = (fileName, positionOrRange, preferences, triggerReason) => {
      try {
        const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange, preferences, triggerReason)
        const program = info.languageService.getProgram()!
        const file = program.getSourceFile(fileName)!
        const range = toRange(positionOrRange)
        const diagnostics = program.getSemanticDiagnostics(file).filter(d => d.code === 2304 && d.start <= range.pos && d.start + d.length >= range.end)
        log('semantic', diagnostics.map(d => ({ messageText: d.messageText, code: d.code })))
        if (!diagnostics.length) {
          return refactors
        }
        const target = findDescendantInPosition(file, range.pos)
        if (!target || target.kind !== ts.SyntaxKind.Identifier || !target.parent || target.parent.kind !== ts.SyntaxKind.CallExpression) {
          return refactors
        }
        refactors.push({
          name: 'create-function',
          description: 'Create function',
          actions: [{ name: 'create-function-global', description: 'Create function in global scope' }]
        })
        return refactors
      }
      catch (error) {
        log('ERROR')
        log(error.toString())
        log(error.stack)
      }
    }

    proxy.getEditsForRefactor = (fileName, formatOptions, positionOrRange, refactorName, actionName, preferences) => {
      if (refactorName !== 'create-function' || actionName !== 'create-function-global') {
        return
      }
      const program = info.languageService.getProgram()!
      const file = program.getSourceFile(fileName)!
      const range = toRange(positionOrRange)
      const target = findDescendantInPosition(file, range.pos)
      const callExpression = target.parent as ts.CallExpression
      const newText = '\n'+`
        function ${target.getText()}(${callExpression.arguments.map((arg, i) => `arg${i}`).join(', ')}) {
          throw new Error('not implemented')
        }`.trim()
      return {
        edits: [
          {
            fileName, 
            textChanges: [
              {
                newText, 
                span: {
                  start: file.end, 
                  length: 0
                }
              }
            ]
          }
        ]
      }
    }

    return proxy;
  }


  // getApplicableRefactors(fileName: string, positionOrRange: number | TextRange, preferences: UserPreferences | undefined, triggerReason?: RefactorTriggerReason): ApplicableRefactorInfo[];
  //       getEditsForRefactor(fileName: string, formatOptions: FormatCodeSettings, positionOrRange: number | TextRange, refactorName: string, actionName: string, preferences: UserPreferences | undefined): RefactorEditInfo | undefined;

  return { create };
}

export = init;


