import { get } from 'hyperquest-promise'
import { basename } from 'misc-utils-of-mine-generic'
import { readFileSync } from 'fs'

export interface File {
  getFilePath(): string
  getContent(): Promise<string>
}

export class ContentFile implements File {
  constructor(protected filePath: string, protected content: string) {}
  getFilePath() {
    return this.filePath
  }
  async getContent() {
    return this.content
  }
}

export class RemoteFile implements File {
  getContentPromise: any
  constructor(protected url: string, protected filePath: string = basename(url)) {}
  getFilePath() {
    return this.filePath
  }
  async getContent() {
    if (!this.getContentPromise) {
      this.getContentPromise = load(this.url)
    }
    const response = await this.getContentPromise
    return response.data
  }
}

export function load(url: string): Promise<{ data: string; response: { url: string } }> {
  if (url.startsWith('file://')) {
    return new Promise(resolve => {
      resolve({
        data: readFileSync(url.substring('file://'.length)).toString(),
        response: {
          url
        }
      })
    })
  } else {
    return get(url)
  }
}
