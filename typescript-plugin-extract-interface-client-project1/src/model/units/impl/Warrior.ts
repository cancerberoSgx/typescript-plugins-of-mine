import { AttackerUnit } from "../AttackerUnit";
import { Unit } from "../Unit";
import { UnitImpl } from "../UnitImpl";

export class Warrior extends UnitImpl implements AttackerUnit {
  attack(target: Unit) { target.health -= 2 }

  move(x: number, y: number, animationMode: 'simple'|'complex', arriveDateLimit: Date): Promise<void>{
    return Promise.resolve()
  }
  
}