
ts-run
======

**API to execute TypeScript**

*   it's like ts-node but in the browser too.
*   browser support,

Usage
-----

```
npm install ts-run
```

### API

*   [api/modules/_run_.md](run())
*   \[api/modules/_types_.md\](run() options)
*   [api/modules/_file_.md](File)

### Browser Example

```ts
const result = await run({
  tsLibBaseUrl: `${location.href}libs/`,
  targetFile: new ContentFile(
    'src/test.ts', `
    import { a } from './foo/foo'; 
    export function test() {
      return a * 2
    }`),
  files: [
    new ContentFile(
      'src/foo/foo.ts', `
      export const a = Math.PI`)
  ],
  tsConfigJson: new RemoteFile(`${location.href}test/tsconfig.json`)
})
console.log(
  'Time: ', printMs(result.totalTime),
  '\nExported: ', result.exported.test(),
  'Errors: \n', result.errors,
  '\nEmitted: \n', result.emitted
)
```

### Node.js Example

```ts
const result = await run({
  tsLibBaseUrl: `file://${resolve('node_modules/typescript/lib')}/`,
  targetFile: new ContentFile('test1.ts', `
    console.log('hello there!')
    export function f() { return 'hello' }
  `),
  tsConfigJson: new RemoteFile(`file://${resolve('tsconfig.json')}`)
})
expect(result.exported.f()).toBe('hello')
```

TODO:
=====

*   webworker/worker [https://nodejs.org/api/worker\_threads.html](https://nodejs.org/api/worker_threads.html)
    
*   libraries load from url o embed in bundle file: The target is the browser and the objective is not performance but that works everywhere. This project when bundled contains a lot of big files that will get embedded (see src/packed). It would good if there is some configuration to allow user to choose which of those to bundle. Now we are packaging all.
    
    [https://unpkg.com/typescript@3.3.4000/lib/](https://unpkg.com/typescript@3.3.4000/lib/)
    
*   is ts-morph really necessary ? perhaps is faster just ts

## Index

### External modules

* ["almondMin"](modules/_almondmin_.md)
* ["emit"](modules/_emit_.md)
* ["file"](modules/_file_.md)
* ["getCompilerOptions"](modules/_getcompileroptions_.md)
* ["index"](modules/_index_.md)
* ["loadFile"](modules/_loadfile_.md)
* ["run"](modules/_run_.md)
* ["types"](modules/_types_.md)

---

