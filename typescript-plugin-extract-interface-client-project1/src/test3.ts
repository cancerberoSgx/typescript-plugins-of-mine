// import { EventEmitter } from "events";
// interface IThing { }
// const siblings: EventEmitter[] = []
// interface ITransport extends IThing { }
// class Transport extends EventEmitter implements ITransport {
//   maxSpeed: number[] = [1]
//   go(to: { x: number, y: number }): Promise<number> {
//     siblings.forEach(c => {
//       if (this.maxSpeed.find(ms => ms === 2)) {
//         this.emit('run')
//       }
//     })
//     return Promise.resolve(1)
//   }
// }