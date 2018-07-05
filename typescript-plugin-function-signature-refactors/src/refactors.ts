import { CodeFix } from "ts-simple-ast-extra";
import { Action } from "typescript-plugins-text-based-user-interaction";
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { ReorderParamsCodeFixImpl } from "./refactors/reorderParams";
import { removeParamsCodeFixImpl } from './refactors/removeParam';

export const PLUGIN_NAME = 'typescript-plugin-function-signature-refactors'

export interface SignatureRefactorArgs {
  log: (msg: string) => void 
  info: ts_module.server.PluginCreateInfo
}

export function getRefactors(options: SignatureRefactorArgs): SignatureRefactorsCodeFix[] {
  if (!refactors) {
    refactors = [new ReorderParamsCodeFixImpl(options), new removeParamsCodeFixImpl(options)]
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
