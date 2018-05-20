import { Fruit } from "./fruit";
import { Eatable } from "./Eatable";
import { Alive } from "./Alive";
import { Seed } from "./seeds";

export class AppleTree implements Alive{
  apples: Apple[]
}
export class Apple extends Fruit implements Eatable, Alive {
  seeds: Array<Array<Array<Seed>>>
  tree: AppleTree  
}