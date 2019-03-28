import { CompilerOptions, ts } from 'ts-morph';
import { File } from './file';
import { dirname } from '.';
export async function getCompilerOptions(f: File) {
  const tsConfigData = await f.getContent();
  const tsconfigPath = dirname(f.getFilePath());
  const compilerOptions: CompilerOptions = parseCompilerOptionsFromText(tsConfigData, tsconfigPath);
  return compilerOptions;
}
export function parseCompilerOptionsFromText(tsConfigData: string, basePath: string) {
  let compilerOptions: CompilerOptions | undefined;
  const jsConfigJson = ts.parseConfigFileTextToJson(basePath, tsConfigData);
  if (jsConfigJson.error) {
    throw 'parseCompilerOptionsFromText jsConfigJson.error 2';
  }
  const tsConfigJson = ts.parseConfigFileTextToJson(basePath, tsConfigData);
  if (tsConfigJson.error) {
    throw 'parseCompilerOptionsFromText tsConfigJson.error 2';
  }
  let r = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, basePath);
  if (r.errors.length) {
    throw 'parseCompilerOptionsFromText r.errors.length';
  }
  compilerOptions = r.options;
  return compilerOptions;
}
