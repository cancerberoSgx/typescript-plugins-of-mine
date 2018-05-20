import { AttackerUnit } from "../AttackerUnit";
import { Unit } from "../Unit";
import { UnitImpl } from "../UnitImpl";

export class Warrior extends UnitImpl implements AttackerUnit {
  attack(target: Unit) { target.health -= 2 }
}