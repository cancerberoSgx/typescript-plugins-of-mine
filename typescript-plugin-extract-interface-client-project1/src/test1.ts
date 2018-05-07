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
  m(b: string):number { return 1 }
}

/**
 * the description for a Vehicle
 */
export class Vehicle extends Transport {
  constructor(iron: number) {
    super()
  }
  engine: { iron: number, gas: Array<string> } = { iron: 3, gas: [] }
  /**
   * start the engine is the first thing before moving we need to do in a vehicle
   * @param strong ohw strong should be the the hand that pull tht trigger?
   */
  public async startEngine(strong: string[]): Promise<boolean> {
    return false
  }
  private p1(): boolean {
    return false
  }
  static s1(): boolean {
    return false
  }
  /**
   * hello
   */
  none(): void {
    if (new Date().getTime()) {
      console.log();
    }
    else {
      console.error();
    }
  }
}
/**
 * the description for a Vehicle
 */
export interface IVehicle {
  constructor():IVehicle;
engine: {
    iron: number;
    gas: Array<string>;
};
  /**
   * start the engine is the first thing before moving we need to do in a vehicle
   * @param strong ohw strong should be the the hand that pull tht trigger?
   */
startEngine(strong: string[]): Promise<boolean>;
  /**
   * hello
   */
none(): void;
}

