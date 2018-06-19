// import { createConsumer, InputConsumerConfig, InputConsumer } from 'input-ui-ipc-provider';

// let inputConsumer: InputConsumer

// export function getInputConsumer(): InputConsumer{
//   if(!inputConsumer){
//     inputConsumer = createConsumer(getConsumerConfig())
//   }
//   return inputConsumer
// }

// function getConsumerConfig(){
//   return {log, port: 3001}
// }

// let log = console.log
// export function setLogger(logger: (msg: string) => void){
//   if(inputConsumer){
//     inputConsumer.setLogger(logger)
//   }
//   log = logger
// }