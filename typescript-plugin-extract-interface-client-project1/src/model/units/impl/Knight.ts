import { AttackerUnit } from "../AttackerUnit";
import { Unit } from "../Unit";
import { UnitImpl } from "../UnitImpl";

export class Knight extends UnitImpl implements AttackerUnit {
  attack(target: Unit) { target.health -= 10 }
}