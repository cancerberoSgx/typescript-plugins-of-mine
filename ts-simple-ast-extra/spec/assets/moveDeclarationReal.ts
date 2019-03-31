import {Project} from 'ts-morph';
import { moveDeclaration } from '../../src';

const p = new Project({ tsConfigFilePath: '/home/sg/git/typescript-plugins-of-mine/ts-run/tsconfig.json', addFilesFromTsConfig: true })
const file = p.getSourceFileOrThrow('file.ts')
const declaration = file.getInterface('File')
const target = p.getSourceFileOrThrow('types.ts')
moveDeclaration({
  target, declaration
})