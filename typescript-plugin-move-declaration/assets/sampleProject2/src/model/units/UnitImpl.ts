import { Unit } from "./Unit";
import { ThingImpl } from "../base/impl/ThingImpl";

export class UnitImpl extends ThingImpl implements Unit {
  health: number=0;
}
