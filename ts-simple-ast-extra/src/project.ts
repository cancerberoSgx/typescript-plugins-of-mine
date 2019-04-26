import { Project } from 'ts-morph'

export function buildProject(options: { tsConfigFilePath: string }) {
  const project = new Project({
    tsConfigFilePath: options.tsConfigFilePath,
    addFilesFromTsConfig: true
  })
  return project
}
