import { Apple } from "./model/apple";
import {a as a2}from "./model/level2/usingApples";
export function createSomeFruits(){
  const a = new Apple()
  a.color="red"
  a.seeds=['1']
  return {apples:[a, a2]}
}