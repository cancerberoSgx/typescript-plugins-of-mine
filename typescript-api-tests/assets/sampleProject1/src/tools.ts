import { Apple } from "./model/apple";
import { a as a2 } from "./model/level2/usingApples";
import { Seed } from "./model/seeds";
export function createSomeFruits() {
  const a = new Apple()
  a.color = "red"
  a.seeds = [[[new Seed(), new Seed()]]]
  return { apples: [a, a2] }
}