export interface IThing { }
export class Transport implements IThing {
  maxSpeed: number = 1
  go(to: { x: number, y: number }): Promise<number> { return Promise.resolve(1) }
}
/**
 * the description for a Vehicle
 */
export class Vehicle extends Transport implements IVehicle {
  constructor(iron: number) {
    super()
  }
  engine: { iron: number, gas: Array<string> } = { iron: 3, gas: [] }
  /**
   * 
   * @param strong will start the engines of this vehicle which is necessary to start moving
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
  none(): void {
    if (new Date().getTime()) {
      console.log();
    }
    else {
      console.error();
    }
  }
}
export interface IVehicle {
  engine: {
    iron: number;
    gas: Array<string>;
  };
  startEngine(strong: string[]): Promise<boolean>;
  none(): void;
}

