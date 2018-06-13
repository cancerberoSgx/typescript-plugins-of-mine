
interface Speedometer{
  // UN INDENTED ON PURPOSE !!!!
  getCurrentSpeed():number
  /** la rotacion del chamaco */
  rotate(force:number):{counterclockwise:boolean, h:number}
  /**
   * @return un numero number importante
   */
  m():number
  go(to:{x:number,y:number}):Promise<void>
}
interface Car  {
  speedometer: Speedometer
}

class Foo{
  speedometer: Speedometer

    public getCurrentSpeed(): number {
        return this.speedometer.getCurrentSpeed(); 
    }

    /**
     * la rotacion del chamaco
     */
    public rotate(force: number): {counterclockwise:boolean, h:number} {
        return this.speedometer.rotate(force); 
    }

    /**
     * @return un numero number importante
     */
    public m(): number {
        return this.speedometer.m(); 
    }

    public go(to: {x:number,y:number}): Promise<void> {
        return this.speedometer.go(to); 
    }
}