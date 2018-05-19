import * as ts from "typescript";

export interface LanguageServiceOptionals {
  cleanupSemanticCache? (): void;
  getSyntacticDiagnostics? (fileName: string): ts.Diagnostic[];
  getSemanticDiagnostics? (fileName: string): ts.Diagnostic[];
  getSuggestionDiagnostics? (fileName: string): ts.Diagnostic[];
  getCompilerOptionsDiagnostics? (): ts.Diagnostic[];
  /**
   * @deprecated Use getEncodedSyntacticClassifications instead.
   */
  getSyntacticClassifications? (fileName: string, span: ts.TextSpan): ts.ClassifiedSpan[];
  /**
   * @deprecated Use getEncodedSemanticClassifications instead.
   */
  getSemanticClassifications? (fileName: string, span: ts.TextSpan): ts.ClassifiedSpan[];
  getEncodedSyntacticClassifications? (fileName: string, span: ts.TextSpan): ts.Classifications;
  getEncodedSemanticClassifications? (fileName: string, span: ts.TextSpan): ts.Classifications;
  getCompletionsAtPosition? (fileName: string, position: number, options: ts.GetCompletionsAtPositionOptions | undefined): ts.CompletionInfo;
  getCompletionEntryDetails? (fileName: string, position: number, name: string, options: ts.FormatCodeOptions | ts.FormatCodeSettings | undefined, source: string | undefined): ts.CompletionEntryDetails;
  getCompletionEntrySymbol? (fileName: string, position: number, name: string, source: string | undefined): Symbol;
  getQuickInfoAtPosition? (fileName: string, position: number): ts.QuickInfo;
  getNameOrDottedNameSpan? (fileName: string, startPos: number, endPos: number): ts.TextSpan;
  getBreakpointStatementAtPosition? (fileName: string, position: number): ts.TextSpan;
  getSignatureHelpItems? (fileName: string, position: number): ts.SignatureHelpItems;
  getRenameInfo? (fileName: string, position: number): ts.RenameInfo;
  findRenameLocations? (fileName: string, position: number, findInStrings: boolean, findInComments: boolean): ts.RenameLocation[];
  getDefinitionAtPosition? (fileName: string, position: number): ts.DefinitionInfo[];
  getDefinitionAndBoundSpan? (fileName: string, position: number): ts.DefinitionInfoAndBoundSpan;
  getTypeDefinitionAtPosition? (fileName: string, position: number): ts.DefinitionInfo[];
  getImplementationAtPosition? (fileName: string, position: number): ts.ImplementationLocation[];
  getReferencesAtPosition? (fileName: string, position: number): ts.ReferenceEntry[];
  findReferences? (fileName: string, position: number): ts.ReferencedSymbol[];
  getDocumentHighlights? (fileName: string, position: number, filesToSearch: string[]): ts.DocumentHighlights[];
  /** @deprecated */
  getOccurrencesAtPosition? (fileName: string, position: number): ts.ReferenceEntry[];
  getNavigateToItems? (searchValue: string, maxResultCount?: number, fileName?: string, excludeDtsFiles?: boolean): ts.NavigateToItem[];
  getNavigationBarItems? (fileName: string): ts.NavigationBarItem[];
  getNavigationTree? (fileName: string): ts.NavigationTree;
  getOutliningSpans? (fileName: string): ts.OutliningSpan[];
  getTodoComments? (fileName: string, descriptors: ts.TodoCommentDescriptor[]): ts.TodoComment[];
  getBraceMatchingAtPosition? (fileName: string, position: number): ts.TextSpan[];
  getIndentationAtPosition? (fileName: string, position: number, options: ts.EditorOptions | ts.EditorSettings): number;
  getFormattingEditsForRange? (fileName: string, start: number, end: number, options: ts.FormatCodeOptions | ts.FormatCodeSettings): ts.TextChange[];
  getFormattingEditsForDocument? (fileName: string, options: ts.FormatCodeOptions | ts.FormatCodeSettings): ts.TextChange[];
  getFormattingEditsAfterKeystroke? (fileName: string, position: number, key: string, options: ts.FormatCodeOptions | ts.FormatCodeSettings): ts.TextChange[];
  getDocCommentTemplateAtPosition? (fileName: string, position: number): ts.TextInsertion;
  isValidBraceCompletionAtPosition? (fileName: string, position: number, openingBrace: number): boolean;
  getSpanOfEnclosingComment? (fileName: string, position: number, onlyMultiLine: boolean): ts.TextSpan;
  getCodeFixesAtPosition? (fileName: string, start: number, end: number, errorCodes: ReadonlyArray<number>, formatOptions: ts.FormatCodeSettings): ReadonlyArray<ts.CodeFixAction>;
  getCombinedCodeFix? (scope: ts.CombinedCodeFixScope, fixId: {}, formatOptions: ts.FormatCodeSettings): ts.CombinedCodeActions;
  applyCodeActionCommand? (action: ts.CodeActionCommand): Promise<ts.ApplyCodeActionCommandResult>;
  applyCodeActionCommand? (action: ts.CodeActionCommand[]): Promise<ts.ApplyCodeActionCommandResult[]>;
  applyCodeActionCommand? (action: ts.CodeActionCommand | ts.CodeActionCommand[]): Promise<ts.ApplyCodeActionCommandResult | ts.ApplyCodeActionCommandResult[]>;
  /** @deprecated `fileName` will be ignored */
  applyCodeActionCommand? (fileName: string, action: ts.CodeActionCommand): Promise<ts.ApplyCodeActionCommandResult>;
  /** @deprecated `fileName` will be ignored */
  applyCodeActionCommand? (fileName: string, action: ts.CodeActionCommand[]): Promise<ts.ApplyCodeActionCommandResult[]>;
  /** @deprecated `fileName` will be ignored */
  applyCodeActionCommand? (fileName: string, action: ts.CodeActionCommand | ts.CodeActionCommand[]): Promise<ts.ApplyCodeActionCommandResult | ts.ApplyCodeActionCommandResult[]>;
  getApplicableRefactors? (fileName: string, positionOrRaneg: number | ts.TextRange): ts.ApplicableRefactorInfo[];
  getEditsForRefactor? (fileName: string, formatOptions: ts.FormatCodeSettings, positionOrRange: number | ts.TextRange, refactorName: string, actionName: string): ts.RefactorEditInfo | undefined;
  organizeImports? (scope: ts.OrganizeImportsScope, formatOptions: ts.FormatCodeSettings): ReadonlyArray<ts.FileTextChanges>;
  getEmitOutput? (fileName: string, emitOnlyDtsFiles?: boolean): ts.EmitOutput;
  getProgram? (): ts.Program; 
  dispose? (): void;
}