
interface Speedometer {
  getCurrentSpeed(): number
  /** the thing rotation thingy */
  rotate(force: number): { counterclockwise: boolean, h: number }
  /**
   * @return a very important number
   */
  m(): number
  go(to: { x: number, y: number }): Promise<void>
}
class Fiat1 {
  // suggested from anywhere inside the property declaration
  speedometer: Speedometer

  public getCurrentSpeed(): number {
    return this.speedometer.getCurrentSpeed();
  }

  /**
   * the thing rotation thingy
   */
  public rotate(force: number): { counterclockwise: boolean, h: number } {
    return this.speedometer.rotate(force);
  }

  /**
   * @return a very important number
   */
  public m(): number {
    return this.speedometer.m();
  }

  public go(to: { x: number, y: number }): Promise<void> {
    return this.speedometer.go(to);
  }
}
interface Car {
  speedometer: Speedometer
  getCurrentSpeed(): number;
  /**
   * the thing rotation thingy
   */
  rotate(force: number): { counterclockwise: boolean, h: number };
  /**
   * @return a very important number
   */
  m(): number;
  go(to: { x: number, y: number }): Promise<void>;
}
