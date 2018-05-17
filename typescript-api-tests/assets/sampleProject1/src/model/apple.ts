import { Fruit } from "./fruit";
import { Eatable } from "./Eatable";
import { Alive } from "./Alive";

export class Apple extends Fruit implements Eatable, Alive {
  seeds: string[]
}