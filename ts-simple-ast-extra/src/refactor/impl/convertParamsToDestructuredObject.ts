import { ParameteredNode, UserPreferences } from 'ts-morph'
import { RefactorFormatBaseOptions } from './format'

export interface ConvertParamsToDestructuredObjectOptions extends RefactorFormatBaseOptions, Partial<UserPreferences> {
  node: ParameteredNode
}

export function convertParamsToDestructuredObject(o: ConvertParamsToDestructuredObjectOptions) {
  const params = o.node.getParameters()
  if (params.length === 0)
    return
  const edits = o.project.getLanguageService().getEditsForRefactor(o.file.getFilePath(), {}, params[0],
    'Convert parameters to destructured object', 'Convert parameters to destructured object', o)
  if (edits)
    edits.applyChanges({ overwrite: true })
}
