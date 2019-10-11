import { detectNewline, wordWrap } from 'misc-utils-of-mine-generic'
import { JSDoc, Node, SyntaxKind } from 'ts-morph'
import { RefactorFormatBaseOptions, setupProjectManipulationSettings } from './format'

interface ConcreteFormatJsdocsOptions {
  formatJsdocs?: boolean
  formatJsdocsFormatBefore?: boolean
  formatJsdocsFormatAfter?: boolean
  jsdocLineMaxLength?: number
}

export interface FormatJsdocsOptions extends RefactorFormatBaseOptions, ConcreteFormatJsdocsOptions {

}

export function formatJsdocs(o: FormatJsdocsOptions) {
  if (typeof o.formatJsdocs === 'undefined') {
    return undefined
  }
  if (!o._projectManipulationSetted) {
    setupProjectManipulationSettings(o)
  }
  if (o.formatJsdocsFormatBefore) {
    o.file.formatText(o)
  }
  o.file.getDescendantsOfKind(SyntaxKind.JSDocComment).sort((a, b) => a.getFullStart() > b.getFullStart() ? -1 : 1).forEach(node => {
    const s = formatJsdocComment({ ...o, node: node })
    if (s) {
      node.replaceWithText(s)
    }
  })
  if (typeof o.formatJsdocsFormatAfter === 'undefined' || o.formatJsdocsFormatAfter) {
    o.file.formatText(o)
  }
}

function formatJsdocComment(o: FormatJsdocsOptions & { node: JSDoc }) {
  const target = o.node.getNextSibling()
  if (!target) {
    return
  }
  const indent2 = getIndent({ ...o, node: target })
  const text = o.node.getInnerText()
  const newLine = detectNewline(text)
  let a = text.split(newLine)
  if (o.jsdocLineMaxLength) {
    a = a.map(l => wordWrap(l, o.jsdocLineMaxLength || 90, newLine).split(newLine)).flat()
  }
  var i3 = indent2.length ? indent2.substring(0, indent2.length - (o.indentSize || 2)) : indent2
  const prefix = indent2 === '' ? ' ' : ' '
  return `${i3}/**${o.newLineCharacter || '\n'}${prefix}* ${a.join(`${o.newLineCharacter || '\n'}${prefix}* `)}${o.newLineCharacter || '\n'}${prefix}*/`
}

function getIndent(o: FormatJsdocsOptions & { node: Node }) {
  const s = o.node.getSourceFile().getFullText()
  var p = o.node.getSourceFile().getLineAndColumnAtPos(o.node.getStart())
  const line = s.split(detectNewline(s))[p.line - 1]
  return line.substring(0, p.column - 1)
}
