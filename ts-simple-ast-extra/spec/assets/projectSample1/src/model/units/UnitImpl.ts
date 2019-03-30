import { Unit } from "./Unit";
import { ThingImpl } from "../base/impl/ThingImpl";

export abstract class UnitImpl extends ThingImpl implements Unit {
  health: number=0

  abstract move(x: number, y: number, animationMode: 'simple'|'complex', arriveDateLimit: Date): Promise<void>
}
