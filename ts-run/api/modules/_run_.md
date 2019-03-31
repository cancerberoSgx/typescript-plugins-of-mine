[ts-run](../README.md) > ["run"](../modules/_run_.md)

# External module: "run"

## Index

### Functions

* [run](_run_.md#run)

---

## Functions

<a id="run"></a>

###  run

▸ **run**(options: *[TsRunOptions](../interfaces/_types_.tsrunoptions.md)*): `Promise`<[TsRunResult](../interfaces/_types_.tsrunresult.md)>

*Defined in [run.ts:13](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/d827319/ts-run/src/run.ts#L13)*

run a ts-morph project without writing to FS (be able to run ts in the browser)

TODO: if in a second run the config is the same, reuse the project, remove all .ts files and add new ones - reuse libs

**Parameters:**

| Name | Type |
| ------ | ------ |
| options | [TsRunOptions](../interfaces/_types_.tsrunoptions.md) |

**Returns:** `Promise`<[TsRunResult](../interfaces/_types_.tsrunresult.md)>

___

