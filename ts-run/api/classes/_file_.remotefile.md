[ts-run](../README.md) > ["file"](../modules/_file_.md) > [RemoteFile](../classes/_file_.remotefile.md)

# Class: RemoteFile

## Hierarchy

**RemoteFile**

## Implements

* [File](../interfaces/_file_.file.md)

## Index

### Constructors

* [constructor](_file_.remotefile.md#constructor)

### Properties

* [filePath](_file_.remotefile.md#filepath)
* [getContentPromise](_file_.remotefile.md#getcontentpromise)
* [url](_file_.remotefile.md#url)

### Methods

* [getContent](_file_.remotefile.md#getcontent)
* [getFilePath](_file_.remotefile.md#getfilepath)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new RemoteFile**(url: *`string`*, filePath?: *`string`*): [RemoteFile](_file_.remotefile.md)

*Defined in [file.ts:20](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/file.ts#L20)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| url | `string` | - |
| `Default value` filePath | `string` |  basename(url) |

**Returns:** [RemoteFile](_file_.remotefile.md)

___

## Properties

<a id="filepath"></a>

### `<Protected>` filePath

**● filePath**: *`string`*

*Defined in [file.ts:21](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/file.ts#L21)*

___
<a id="getcontentpromise"></a>

###  getContentPromise

**● getContentPromise**: *`any`*

*Defined in [file.ts:20](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/file.ts#L20)*

___
<a id="url"></a>

### `<Protected>` url

**● url**: *`string`*

*Defined in [file.ts:21](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/file.ts#L21)*

___

## Methods

<a id="getcontent"></a>

###  getContent

▸ **getContent**(): `Promise`<`any`>

*Implementation of [File](../interfaces/_file_.file.md).[getContent](../interfaces/_file_.file.md#getcontent)*

*Defined in [file.ts:25](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/file.ts#L25)*

**Returns:** `Promise`<`any`>

___
<a id="getfilepath"></a>

###  getFilePath

▸ **getFilePath**(): `string`

*Implementation of [File](../interfaces/_file_.file.md).[getFilePath](../interfaces/_file_.file.md#getfilepath)*

*Defined in [file.ts:22](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/file.ts#L22)*

**Returns:** `string`

___

