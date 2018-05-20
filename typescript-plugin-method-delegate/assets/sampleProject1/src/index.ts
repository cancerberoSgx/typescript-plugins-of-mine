
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
}