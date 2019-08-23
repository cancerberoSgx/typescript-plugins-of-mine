import { detectNewline } from 'misc-utils-of-mine-generic'
import { JSDoc, Node, SyntaxKind } from 'ts-morph'
import { RefactorFormatBaseOptions } from './format'

interface ConcreteFormatJsdocsOptions {
  formatJsdocs?: boolean
}

export interface FormatJsdocsOptions extends RefactorFormatBaseOptions, ConcreteFormatJsdocsOptions {

}

export function formatJsdocs(o: FormatJsdocsOptions) {
  if (typeof o.formatJsdocs === 'undefined') {
    return undefined
  }
  // formatOnly({file: o.file, project: o.project, indentSize: 2, convertTabsToSpaces: true})
  o.file.getDescendantsOfKind(SyntaxKind.JSDocComment).sort((a, b) => a.getFullStart() > b.getFullStart() ? -1 : 1).forEach(node => {
    const s = formatJsdocComment({ ...o, node: node })
    // console.log(s);
    if (s) {
      node.replaceWithText(s)
    }
    // console.log(s);
  })
}

export function formatJsdocComment(o: FormatJsdocsOptions & { node: JSDoc }) {
  // const indent = repeat(o.node.getIndentationLevel(), s)'  '
  const target = o.node.getNextSibling()
  if (!target) {
    return
  }
  // const indent = ''
  const indent2 = getIndent(target)

  const text = o.node.getInnerText() || ''
  const a = text.split(detectNewline(text)).map(l => {
    const s = l.trimLeft()
    return s.startsWith('*') ? s.substring(1) : s
  })
  // console.log(a);
  var i3 = indent2.length ? indent2.substring(0, indent2.length - 2) : indent2
  const prefix = indent2 === '' ? ' ' : ''
  // const indent2 = indent===''?indent:indent.substring(0, indent.length-1)
  const r = `${i3}/**${o.newLineCharacter || '\n'}${prefix}* ${a.join(`${o.newLineCharacter || '\n'}${prefix}* `)}${o.newLineCharacter || '\n'}${prefix}*/`
  // const r= `${indent}${indent===''?'':''}/**${o.newLineCharacter||'\n'}${indent}${prefix}* ${a.join(`${o.newLineCharacter||'\n'}${indent}${prefix}* `)}${o.newLineCharacter||'\n'}${indent}${prefix}*/`
  // console.log({indent, r});
  return r
  // return `/** ${text} seba */`
  // const a = o.node.getFullText().split('\n')

  // const indent = o.node.getIndentationText()
  // if(a)
}

function getIndent(node: Node) {
  const s = node.getSourceFile().getFullText()
  var p = node.getSourceFile().getLineAndColumnAtPos(node.getStart())
  const line = s.split(detectNewline(s))[p.line - 1]
  return line.substring(0, p.column - 1)
}
