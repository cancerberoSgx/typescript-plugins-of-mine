
  import * as ts from 'typescript'

  const transform = {
    [ts.SyntaxKind.SourceFile]: (node: any) => {
      const file = (node as ts.Node) as ts.SourceFile
      const update = ts.updateSourceFileNode(file, [
        ts.createImportDeclaration(
          undefined,
          undefined,
          ts.createImportClause(
            ts.createIdentifier('salami'),
            undefined
          ),
          ts.createLiteral('salami')
        ),
        ...file.statements
      ])
      return update as ts.Node
    }
  }

  
  function visitor(transform: any) {
    return (context: ts.TransformationContext) => {
      return (sourceFile: ts.SourceFile): ts.SourceFile => {
        return visit(sourceFile)
        function visit<T extends ts.Node>(node: T): T {
          const t = transform[node.kind]
          if (!t) {
            return ts.visitEachChild(node, visit, context)
          }
  
          // enter a node
          if (typeof t === 'object' && t.enter) {
            const tr = t.enter(node, context)
            if (tr) node = tr as T
          }
  
          // if it's a function, treat it
          // the same way as t.enter
          if (typeof t === 'function') {
            const tr = t(node, context)
            if (tr) node = tr as T
          }
  
          // visit each child
          let exitNode = ts.visitEachChild(node, visit, context)
  
          // if we have an exit call function
          if (typeof t === 'object' && t.exit) {
            const tr = t.exit(exitNode, context)
            if (tr) exitNode = tr as T
          }
  
          return exitNode
        }
      }
    }
  }
  



  const f = ts.createLanguageServiceSourceFile('fo.ts', ts.ScriptSnapshot.fromString('class C{}'), ts.ScriptTarget.ESNext, '0.0.1', true, ts.ScriptKind.TS)
 const tf =  ts.transform(f,  [visitor(transform)] )
 console.log(ts.createPrinter().printFile(tf.transformed[0]));

