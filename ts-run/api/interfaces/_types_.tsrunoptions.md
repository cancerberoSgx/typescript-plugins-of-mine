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

*Defined in [types.ts:7](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/types.ts#L7)*

___
<a id="debug"></a>

### `<Optional>` debug

**● debug**: *`undefined` \| `false` \| `true`*

*Defined in [types.ts:53](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/types.ts#L53)*

Will print debug information using `console.log`

___
<a id="dontcleanproject"></a>

### `<Optional>` dontCleanProject

**● dontCleanProject**: *`undefined` \| `false` \| `true`*

*Defined in [types.ts:48](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/types.ts#L48)*

See [project](_types_.tsrunoptions.md#project)

___
<a id="donteval"></a>

### `<Optional>` dontEval

**● dontEval**: *`undefined` \| `false` \| `true`*

*Defined in [types.ts:37](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/types.ts#L37)*

If true it wont eval the emitted text and just return the code as string in `èmitter`

___
<a id="files"></a>

### `<Optional>` files

**● files**: *[File](_file_.file.md)[]*

*Defined in [types.ts:15](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/types.ts#L15)*

The project's source files. If targetFile imports modules, they should be listed here.

___
<a id="project"></a>

### `<Optional>` project

**● project**: *`Project`*

*Defined in [types.ts:44](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/types.ts#L44)*

If given, it will ignore compilerOptions/tsConfigJson, won't load libraries and just use this project as it is.

By default all project source files will be deleted. Use [dontCleanProject](_types_.tsrunoptions.md#dontcleanproject) to prevent it.

___
<a id="targetfile"></a>

###  targetFile

**● targetFile**: *[File](_file_.file.md) \| `string`*

*Defined in [types.ts:23](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/types.ts#L23)*

The file to run. Provide a string to run one of the files in `files`

___
<a id="tsconfigjson"></a>

### `<Optional>` tsConfigJson

**● tsConfigJson**: *[File](_file_.file.md)*

*Defined in [types.ts:11](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/types.ts#L11)*

`tsConfig.json` file to configure the project.

___
<a id="tslibbaseurl"></a>

### `<Optional>` tsLibBaseUrl

**● tsLibBaseUrl**: *`undefined` \| `string`*

*Defined in [types.ts:32](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/types.ts#L32)*

Base path of TypeScript `lib.*.d.ts` files (like `lib/lib.es2015.d.ts`). In the desktop these files are located at `node_modules/typescript/lib`.

In the browser a npm cdn like `https://unpkg.com/typescript@3.3.4000/lib/` should work.

Alternatively, the files could be embedded in the code so there is no delay fetching the resources.

___
<a id="verifynoprojecterrors"></a>

### `<Optional>` verifyNoProjectErrors

**● verifyNoProjectErrors**: *`undefined` \| `false` \| `true`*

*Defined in [types.ts:19](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/09fbfec/ts-run/src/types.ts#L19)*

It will verify that the project has no compile errors, just before emitting JS. Note that this will slow down the execution.

___

