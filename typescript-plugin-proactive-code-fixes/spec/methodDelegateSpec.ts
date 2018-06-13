const code = `
class Fiat1 {
  speedometer: Speedometer // suggested from anywhere inside the property declaration
}
interface Speedometer {
  /**
   * return the current speed in km/h
   */
  getCurrentSpeed(): number
  /**
   * change the current angle of this host
   */
  rotate(force: number): { counterclockwise: boolean, h: number }
  m(): number
  /**
   * starts procedures to move to given location 
   */
  go(to: { x: number, y: number }): Promise<void>
}`

import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'

describe('methodDelegate', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('basic', async () => {
    basicTest(25, config, 'methodDelegate', [`/** * return the current speed in km/h */ public getCurrentSpeed(): number { return this.speedometer.getCurrentSpeed(); } /** * change the current angle of this host */ public rotate(force: number): { counterclockwise: boolean, h: number } { return this.speedometer.rotate(force); } public m(): number { return this.speedometer.m(); } /** * starts procedures to move to given location */ public go(to: { x: number, y: number }): Promise<void> { return this.speedometer.go(to); }`])
  })
  afterEach(() => {
    defaultAfterEach(config)
  })
})

// class Fiat1 { speedometer: Speedometer // suggested from anywhere inside the property declaration } interface Speedometer { /** * return the current speed in km/h */ getCurrentSpeed(): number /** * change the current angle of this host */ rotate(force: number): { counterclockwise: boolean, h: number } m(): number /** * starts procedures to move to given location */ go(to: { x: number, y: number }): Promise<void> } 
// class Fiat1 { speedometer: Speedometer /** * return the current speed in km/h */ public getCurrentSpeed(): number { return this.speedometer.getCurrentSpeed(); } /** * change the current angle of this host */ public rotate(force: number): { counterclockwise: boolean, h: number } { return this.speedometer.rotate(force); } public m(): number { return this.speedometer.m(); } /** * starts procedures to move to given location */ public go(to: { x: number, y: number }): Promise<void> { return this.speedometer.go(to); } // suggested from anywhere inside the property declaration } interface Speedometer { /** * return the current speed in km/h */ getCurrentSpeed(): number /** * change the current angle of this host */ rotate(force: number): { counterclockwise: boolean, h: number } m(): number /** * starts procedures to move to given location */ go(to: { x: number, y: number }): Promise<void> } 
