import { get } from 'hyperquest-promise'
import PQueue from 'p-queue'
import { basename } from 'misc-utils-of-mine-generic'
export async function loadLibrariesFromUrl(url: string) {
  const queue = new PQueue({ concurrency: 3 })
  // http://127.0.0.1:8080/libs/lib.dom.iterable.d.ts
  const responses = await queue.addAll(allTsLibraryNames.map(l => () => get(`${url}${l}`)))
  // console.log(responses.map((r, i) => r))
  // TODO: options.url can be undefined
  return responses.map(r => ({
    url: r.response.url,
    content: r.data,
    fileName: `node_modules/typescript/lib/${basename(r.response.url!)}`
  }))
}
export const allTsLibraryNames = [
  'lib.dom.d.ts',
  'lib.es2015.symbol.d.ts',
  'lib.es2017.string.d.ts',
  'lib.esnext.asynciterable.d.ts',
  'lib.dom.iterable.d.ts',
  'lib.es2015.symbol.wellknown.d.ts',
  'lib.es2017.typedarrays.d.ts',
  'lib.esnext.bigint.d.ts',
  'lib.es2015.collection.d.ts',
  'lib.es2016.array.include.d.ts',
  'lib.es2018.d.ts',
  'lib.esnext.d.ts',
  'lib.es2015.core.d.ts',
  'lib.es2016.d.ts',
  'lib.es2018.full.d.ts',
  'lib.esnext.full.d.ts',
  'lib.es2015.d.ts',
  'lib.es2016.full.d.ts',
  'lib.es2018.intl.d.ts',
  'lib.esnext.intl.d.ts',
  'lib.es2015.generator.d.ts',
  'lib.es2017.d.ts',
  'lib.es2018.promise.d.ts',
  'lib.esnext.symbol.d.ts',
  'lib.es2015.iterable.d.ts',
  'lib.es2017.full.d.ts',
  'lib.es2018.regexp.d.ts',
  'lib.scripthost.d.ts',
  'lib.es2015.promise.d.ts',
  'lib.es2017.intl.d.ts',
  'lib.es5.d.ts',
  'lib.webworker.d.ts',
  'lib.es2015.proxy.d.ts',
  'lib.es2017.object.d.ts',
  'lib.es6.d.ts',
  'lib.webworker.importscripts.d.ts',
  'lib.es2015.reflect.d.ts',
  'lib.es2017.sharedmemory.d.ts',
  'lib.esnext.array.d.ts'
]
