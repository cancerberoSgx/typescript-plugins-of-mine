import { get } from 'hyperquest-promise'
import { basename } from 'misc-utils-of-mine-generic'

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
      this.getContentPromise = get(this.url)
    }
    const response = await this.getContentPromise
    return response.data
  }
}