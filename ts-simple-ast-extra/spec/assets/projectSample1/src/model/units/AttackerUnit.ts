import { Unit } from './Unit'

export interface AttackerUnit extends Unit {
  attack(target: Unit): void
}
