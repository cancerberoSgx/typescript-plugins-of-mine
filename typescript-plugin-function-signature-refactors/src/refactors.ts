import { CodeFix } from "typescript-plugin-util";
import { Action } from "typescript-plugins-text-based-user-interaction";
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { ReorderParamsCodeFixImpl } from "./refactors/reorderParams/reorderParamsPlugin";

export const PLUGIN_NAME = 'typescript-plugin-function-signature-refactors'

export interface SignatureRefactorArgs {
  log: (msg) => void
  program: ts.Program
}

export function getRefactors(options: SignatureRefactorArgs): SignatureRefactorsCodeFix[] {
  if (!refactors) {
    refactors = [new ReorderParamsCodeFixImpl(options)]
  }
  return refactors
}

let refactors: SignatureRefactorsCodeFix[]

export interface SignatureRefactorsCodeFix extends CodeFix {
  getCompletionsAtPosition(fileName: string, position: number, options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionEntry[];
  /** helper that implements a generic langauge service method getApplicableRefactors */
  getApplicableRefactors(info: ts_module.server.PluginCreateInfo, refactorName: string, refactorActionName: string, fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts_module.UserPreferences): {
    refactors: ts.ApplicableRefactorInfo[];
    selectedAction?: Action;
  };
}
