TypeScript support for naming Nodes uniquely and query them. This is particularly useful when modifying the nodes in an iteration and quickly query them again in libraries like ts-simple-ast. In pure TypeScript API this is not so useful since ts APIs for modifications (transformation, replaceText, etc) always generate new SourceFile and nodes, but in other libraries like ts-simple-ast where you can modify the same AST when visiting its nodes, the AST get's deprecated with some modifications and having this feature is useful. 

See https://github.com/dsherret/ts-simple-ast/issues/351

```ts

import {install, getNodeById, getId} from 'ts-node-ids'

install(sourceFile)

visitAllDescendants(sourceFile, (node=>{if(someCondition(node)){targets.push(getId(node))}})

// later...
targets.forEach(id=>modifNodeSomeHow(getNodeById(sourceFile, id)))

```

will iterate recursively through given file and add ids to all nodes in the format `${parentId}.${counter}` so they are unique and easy / cheap to query


# Impl notes

 * we cannot reuse typescript implementation for ts-simple-ast implementation since tsNode.compilerNode are changed all the time and we cannot be notified when this happens

# TODO

## Automatically detect AST modifications

 * maybe having a richer key that includes the node kind is more powerfull - if you delete a method other class members keys, like attributes, will still be valid.
     * isValid(node)  1) store a map in the node per kind and counter of chid nodes of that kind. 2) then we have a way of knowing if user removed / added new nodes and exactly where so we can re-install ids automatically for example cache invalidation
     * will this work when user changes values like id.text ? is that possible ? 

## Cache

 * getById with cache ? and api for invalidation ?  - if key is a.b.c.d we can check cache for a.b.c or a.b or a first. 

## Performance

 * implement visit_getChildren probably faster - always pass sourcefile !
 * benchmark and compare visit_getChildren against visit_forEachChild

## other
 * support ts-simple-ast that's where this make sense - but probably in a separate lib dependant on this one
