import { Thing } from "../base/Thing";

export interface Unit extends Thing {
  health: number
  move(x: number, y: number, animationMode: 'simple'|'complex', arriveDateLimit: Date): Promise<void>
}
