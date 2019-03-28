import { CompilerOptions } from 'ts-morph';
import { File } from './file';


export interface TsRunOptions {
  /** TODO: currently only remote supported - future - at compile time we can embed all libraries in the bundle */
  mode?: 'remote' | 'embed';
  compilerOptions?: CompilerOptions;
  tsConfigJson?: File;
  files: File[];
  verifyNoProjectErrors?: boolean;
  targetFile: File;
  /** where lib.*.d.ts files are available for fetching. nopkg npm cdn like.  */
  tsLibBaseUrl?: string;
  /** if true it wont eval the emitted text and just return it */
  dontEval?: boolean
}
export interface TsRunResult<T = any> {
  /** the result of evaluating the emitted output */
  result: T;
  errors: any[];
  /** target file emitted text */
  emitted: string;
}
