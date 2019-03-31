import { Project, CompilerOptions } from 'ts-morph'
import { File } from './file'

export interface TsRunOptions {
  // /** TODO: currently only remote supported - future - at compile time we can embed all libraries in the bundle */
  // mode?: 'remote' | 'embed'
  compilerOptions?: CompilerOptions
  /**
   * `tsConfig.json` file to configure the project.
   */
  tsConfigJson?: File
  /**
   * The project's source files. If targetFile imports modules, they should be listed here.
   */
  files?: File[]
  /**
   * It will verify that the project has no compile errors, just before emitting JS. Note that this will slow down the execution.
   */
  verifyNoProjectErrors?: boolean
  /**
   * The file to run. Provide a string to run one of the files in `files`
   */
  targetFile: File | string
  /**
   * Base path of TypeScript `lib.*.d.ts` files (like `lib/lib.es2015.d.ts`). In the desktop these files are located at
   * `node_modules/typescript/lib`.
   *
   * In the browser a npm cdn like `https://unpkg.com/typescript@3.3.4000/lib/` should work.
   *
   * Alternatively, the files could be embedded in the code so there is no delay fetching the resources.
   */
  tsLibBaseUrl?: string

  /**
   * If true it wont eval the emitted text and just return the code as string in `èmitter`
   */
  dontEval?: boolean

  /**
   * If given, it will ignore compilerOptions/tsConfigJson, won't load libraries and just use this project as it is.
   *
   * By default all project source files will be deleted. Use [[dontCleanProject]] to prevent it.
   */
  project?: Project
  /**
   * See [[project]]
   */
  dontCleanProject?: boolean

  /**
   * Will print debug information using `console.log`
   */
  debug?: boolean
}
export interface TsRunResult<T = any> {
  // /** the result of evaluating the emitted output */
  // result: T
  errors: any[]
  /** target file emitted text */
  emitted: string
  project: Project
  totalTime: number
  /** target module export value */
  exported: any | undefined
}
