import { Thing } from '../Thing'

export class ThingImpl implements Thing {
  constructor() {
    this.name = ''
    this.description = ''
    this.id = Math.random() + ''
  }
  name: string
  description: string
  id: string
}
