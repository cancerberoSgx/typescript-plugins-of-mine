import { detectNewline } from 'misc-utils-of-mine-generic'
import { JSDoc, Node, SyntaxKind } from 'ts-morph'
import { RefactorFormatBaseOptions, setupProjectManipulationSettings } from './format'

interface ConcreteFormatJsdocsOptions {
  formatJsdocs?: boolean
  formatJsdocsFormatBefore?: boolean
  formatJsdocsFormatAfter?: boolean
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
  const text = getInnerText(o.node)
  const a = text.split(detectNewline(text))
  var i3 = indent2.length ? indent2.substring(0, indent2.length - (o.indentSize || 2)) : indent2
  const prefix = indent2 === '' ? ' ' : ' '
  return `${i3}/**${o.newLineCharacter || '\n'}${prefix}* ${a.join(`${o.newLineCharacter || '\n'}${prefix}* `)}${o.newLineCharacter || '\n'}${prefix}*/`
}

/**
 * https://github.com/dsherret/ts-morph/pull/691
 */
function getInnerText(n: JSDoc) {
  const innerTextWithStars = n.getText().replace(/^\/\*\*[^\S\n]*\n?/, "").replace(/(\r?\n)?[^\S\n]*\*\/$/, "")
  return innerTextWithStars.split(/\n/).map(line => {
    const starPos = line.indexOf("*")
    if (starPos === -1 || line.substring(0, starPos).trim() !== "")
      return line
    const substringStart = line[starPos + 1] === " " ? starPos + 2 : starPos + 1
    return line.substring(substringStart)
  }).join("\n")
}

function getIndent(o: FormatJsdocsOptions & { node: Node }) {
  const s = o.node.getSourceFile().getFullText()
  var p = o.node.getSourceFile().getLineAndColumnAtPos(o.node.getStart())
  const line = s.split(detectNewline(s))[p.line - 1]
  return line.substring(0, p.column - 1)
}
