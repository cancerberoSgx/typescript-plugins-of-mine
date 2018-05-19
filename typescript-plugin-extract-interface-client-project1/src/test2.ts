import { EventEmitter } from "events";
interface IThing {}
interface ITransport extends IThing { }
class Transport implements ITransport {
  maxSpeed = 1
  m():  number{return 1}
  go(to: { x: number, y: number }) { return Promise.resolve(1) }
}
class Vehicle extends Transport { 
  constructor(iron: number) {
    super()
  }
}
class Car extends Vehicle {
}
