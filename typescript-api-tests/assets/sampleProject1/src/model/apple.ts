import { Fruit } from "./fruit";
import { Eatable } from "./Eatable";
import { Alive } from "./Alive";
import { Seed } from "./seeds";

export class Apple extends Fruit implements Eatable, Alive {
  seeds: Array<Seed>
}