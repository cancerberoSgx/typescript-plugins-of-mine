export class Transport {
  maxSpeed: number = 1
  go(to: {x:number,y: number}):Promise<number>{return Promise.resolve(1)}
}

export class Vehicle extends Transport {
  engine: {iron:number, gas: Array<string>} = {iron: 3, gas: []}
  startEngine(): boolean{return false}
}