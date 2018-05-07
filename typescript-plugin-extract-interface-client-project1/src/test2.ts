import { EventEmitter } from "events";
interface IThing {}
interface ITransport extends IThing { }
class Transport implements ITransport {
  maxSpeed: number = 1
  go(to: { x: number, y: number }): Promise<number> { return Promise.resolve(1) }
}
class Vehicle extends Transport {
  constructor(iron: number) {
    super()
  }
}
class Car extends Vehicle {
}