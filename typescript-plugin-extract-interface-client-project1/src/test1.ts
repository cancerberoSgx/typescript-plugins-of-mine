import { EventEmitter } from "events";

export interface IThing { }
export interface ITransport extends IThing { }

export class Transport implements ITransport {
  maxSpeed: number = 1
  go(to: { x: number, y: number }): Promise<number> { return Promise.resolve(1) }
}

/**
 * description of something classy
 * 
 * Another paragraph with ex: 
 * 
 */
class A {
  /**
   * @param b hello
   * @return the number one
   */
  m(b: string): number { return 1 }
}

/**
 * the description for a Vehicle
 * @param T type of the passengers
 */
export class Vehicle<T> {
  constructor(iron: number) {
    this.n = 1
  }
  n: number
  engine: { iron: number, gas: Array<string> } = { iron: 3, gas: [] }
  /**
   * start the engine is the first thing before moving we need to do in a vehicle
   * @param strong ohw strong should be the the hand that pull tht trigger?
   */
  public async startEngine(strong: string[]): Promise<boolean> {
    return false
  }
  private privateMethod1(): boolean {
    return false
  }
  static staticMethod(): boolean {
    return false
  }
  /* this si not jsdoc  */
  none(): void {
    if (new Date().getTime()) {
      console.log();
    }
    else {
      console.error();
    }
  }
}