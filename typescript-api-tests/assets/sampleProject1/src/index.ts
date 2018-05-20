
interface Speedometer{
  // UN INDENTED ON PURPOSE !!!!
  getCurrentSpeed():number
  rotate(force:number):{counterclockwise:boolean, h:number}
  m():number
  go(to:{x:number,y:number}):Promise<void>
}
interface Car  {
  speedometer: Speedometer
}

class Foo{
  speedometer: Speedometer
}