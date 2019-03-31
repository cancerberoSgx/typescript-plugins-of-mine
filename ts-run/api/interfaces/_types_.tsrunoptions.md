[ts-run](../README.md) > ["types"](../modules/_types_.md) > [TsRunOptions](../interfaces/_types_.tsrunoptions.md)

# Interface: TsRunOptions

## Hierarchy

**TsRunOptions**

## Index

### Properties

* [compilerOptions](_types_.tsrunoptions.md#compileroptions)
* [debug](_types_.tsrunoptions.md#debug)
* [dontCleanProject](_types_.tsrunoptions.md#dontcleanproject)
* [dontEval](_types_.tsrunoptions.md#donteval)
* [files](_types_.tsrunoptions.md#files)
* [mode](_types_.tsrunoptions.md#mode)
* [project](_types_.tsrunoptions.md#project)
* [targetFile](_types_.tsrunoptions.md#targetfile)
* [tsConfigJson](_types_.tsrunoptions.md#tsconfigjson)
* [tsLibBaseUrl](_types_.tsrunoptions.md#tslibbaseurl)
* [verifyNoProjectErrors](_types_.tsrunoptions.md#verifynoprojecterrors)

---

## Properties

<a id="compileroptions"></a>

### `<Optional>` compilerOptions

**● compilerOptions**: *`CompilerOptions`*

*Defined in [types.ts:7](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/344cbd0/ts-run/src/types.ts#L7)*

___
<a id="debug"></a>

### `<Optional>` debug

**● debug**: *`undefined` \| `false` \| `true`*

*Defined in [types.ts:25](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/344cbd0/ts-run/src/types.ts#L25)*

___
<a id="dontcleanproject"></a>

### `<Optional>` dontCleanProject

**● dontCleanProject**: *`undefined` \| `false` \| `true`*

*Defined in [types.ts:23](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/344cbd0/ts-run/src/types.ts#L23)*

see [project](_types_.tsrunoptions.md#project)

___
<a id="donteval"></a>

### `<Optional>` dontEval

**● dontEval**: *`undefined` \| `false` \| `true`*

*Defined in [types.ts:18](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/344cbd0/ts-run/src/types.ts#L18)*

if true it wont eval the emitted text and just return it

___
<a id="files"></a>

### `<Optional>` files

**● files**: *[File](_file_.file.md)[]*

*Defined in [types.ts:12](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/344cbd0/ts-run/src/types.ts#L12)*

the rest of the project files

___
<a id="mode"></a>

### `<Optional>` mode

**● mode**: *"remote" \| "embed"*

*Defined in [types.ts:6](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/344cbd0/ts-run/src/types.ts#L6)*

TODO: currently only remote supported - future - at compile time we can embed all libraries in the bundle

___
<a id="project"></a>

### `<Optional>` project

**● project**: *`Project`*

*Defined in [types.ts:21](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/344cbd0/ts-run/src/types.ts#L21)*

if given, it will ignores compilerOptions/tsConfigJson, won't load libraries and just use this project as it is. Use [dontCleanProject](_types_.tsrunoptions.md#dontcleanproject) to not remove its .ts files before adding the new execution ones

___
<a id="targetfile"></a>

###  targetFile

**● targetFile**: *[File](_file_.file.md)*

*Defined in [types.ts:14](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/344cbd0/ts-run/src/types.ts#L14)*

___
<a id="tsconfigjson"></a>

### `<Optional>` tsConfigJson

**● tsConfigJson**: *[File](_file_.file.md)*

*Defined in [types.ts:8](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/344cbd0/ts-run/src/types.ts#L8)*

___
<a id="tslibbaseurl"></a>

### `<Optional>` tsLibBaseUrl

**● tsLibBaseUrl**: *`undefined` \| `string`*

*Defined in [types.ts:16](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/344cbd0/ts-run/src/types.ts#L16)*

where lib.\*.d.ts files are available for fetching. nopkg npm cdn like.

___
<a id="verifynoprojecterrors"></a>

### `<Optional>` verifyNoProjectErrors

**● verifyNoProjectErrors**: *`undefined` \| `false` \| `true`*

*Defined in [types.ts:13](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/344cbd0/ts-run/src/types.ts#L13)*

___

