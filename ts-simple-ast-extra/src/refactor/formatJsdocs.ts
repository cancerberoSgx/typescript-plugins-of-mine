import { detectNewline } from 'misc-utils-of-mine-generic'
import { JSDoc, Node, SyntaxKind } from 'ts-morph'
import { RefactorFormatBaseOptions, setupProjectManipulationSettings } from './format'

interface ConcreteFormatJsdocsOptions {
  formatJsdocs?: boolean
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


  // formatOnly({file: o.file, project: o.project, indentSize: 2, convertTabsToSpaces: true})
  o.file.getDescendantsOfKind(SyntaxKind.JSDocComment).sort((a, b) => a.getFullStart() > b.getFullStart() ? -1 : 1).forEach(node => {
    const s = formatJsdocComment({ ...o, node: node })
    // console.log(s);
    if (s) {
      node.replaceWithText(s)
    }
    // console.log(s);
  })
    o.file.formatText(o)
}

function formatJsdocComment(o: FormatJsdocsOptions & { node: JSDoc }) {
  // const indent = repeat(o.node.getIndentationLevel(), s)'  '
  const target = o.node.getNextSibling()
  if (!target) {
    return
  }
  // const indent = ''
  const indent2 = getIndent({ ...o, node: target })

  const text = getInnerText(o.node)
  // const text = o.node.getFullText().trim().substring(3, o.node.getFullText().length-2)
  // console.log({text});
  // process.exit(1)
  const a = text.split(detectNewline(text))
  // const hasAsterix = !o.node.getFullText().trim().substring(3, o.node.getFullText().length-2).split(detectNewline(text)).find(l=>!l.trimLeft().startsWith('*'))
  // const a = lines.map(l => {
  // return l
  //   // return hasAsterix ? l.trimLeft().substring(1) : l
  // })
  var i3 = indent2.length ? indent2.substring(0, indent2.length - (o.indentSize || 2)) : indent2
  const prefix = indent2 === '' ? ' ' : ' '
  // const indent2 = indent===''?indent:indent.substring(0, indent.length-1)
 return  `${i3}/**${o.newLineCharacter || '\n'}${prefix}* ${a.join(`${o.newLineCharacter || '\n'}${prefix}* `)}${o.newLineCharacter || '\n'}${prefix}*/`
  // const r= `${indent}${indent===''?'':''}/**${o.newLineCharacter||'\n'}${indent}${prefix}* ${a.join(`${o.newLineCharacter||'\n'}${indent}${prefix}* `)}${o.newLineCharacter||'\n'}${indent}${prefix}*/`
  // console.log({indent, r});
  // return r
  // return `/** ${text} seba */`
  // const a = o.node.getFullText().split('\n')

  // const indent = o.node.getIndentationText()
  // if(a)

}

    /**
     * https://github.com/dsherret/ts-morph/pull/691
     */
    function getInnerText(n:JSDoc) {
        const innerTextWithStars = n.getText().replace(/^\/\*\*[^\S\n]*\n?/, "").replace(/(\r?\n)?[^\S\n]*\*\/$/, "");

        return innerTextWithStars.split(/\n/).map(line => {
            const starPos = line.indexOf("*");
            if (starPos === -1 || line.substring(0, starPos).trim() !== "")
                return line;
            const substringStart = line[starPos + 1] === " " ? starPos + 2 : starPos + 1;
            return line.substring(substringStart);
        }).join("\n");
    }

function getIndent(o: FormatJsdocsOptions & { node: Node }) {
  // const l = o.project.getLanguageService().compilerObject.getIndentationAtPosition(o.file.getFilePath(), o.node.getStart(), o)
  // return repeat(l, ' ')

  const s = o.node.getSourceFile().getFullText()
  var p = o.node.getSourceFile().getLineAndColumnAtPos(o.node.getStart())
  const line = s.split(detectNewline(s))[p.line - 1]
  return line.substring(0, p.column - 1)
}
