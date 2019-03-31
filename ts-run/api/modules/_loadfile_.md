[ts-run](../README.md) > ["loadFile"](../modules/_loadfile_.md)

# External module: "loadFile"

## Index

### Variables

* [allTsLibraryNames](_loadfile_.md#alltslibrarynames)

### Functions

* [load](_loadfile_.md#load)
* [loadFiles](_loadfile_.md#loadfiles)
* [loadLibrariesFromUrl](_loadfile_.md#loadlibrariesfromurl)

---

## Variables

<a id="alltslibrarynames"></a>

### `<Const>` allTsLibraryNames

**● allTsLibraryNames**: *`string`[]* =  [
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

*Defined in [loadFile.ts:40](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/loadFile.ts#L40)*

___

## Functions

<a id="load"></a>

###  load

▸ **load**(url: *`string`*): `Promise`<`object`>

*Defined in [loadFile.ts:13](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/loadFile.ts#L13)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |

**Returns:** `Promise`<`object`>

___
<a id="loadfiles"></a>

###  loadFiles

▸ **loadFiles**(files: *[File](../interfaces/_file_.file.md)[]*): `Promise`<`object`[]>

*Defined in [loadFile.ts:7](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/loadFile.ts#L7)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| files | [File](../interfaces/_file_.file.md)[] |

**Returns:** `Promise`<`object`[]>

___
<a id="loadlibrariesfromurl"></a>

###  loadLibrariesFromUrl

▸ **loadLibrariesFromUrl**(url: *`string`*): `Promise`<`object`[]>

*Defined in [loadFile.ts:28](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/loadFile.ts#L28)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |

**Returns:** `Promise`<`object`[]>

___

