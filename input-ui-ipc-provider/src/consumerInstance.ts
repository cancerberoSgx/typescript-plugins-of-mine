//why ? we need one consumer because right now is the server and we have only one provider (in the editor) - we cannot instantiate more than one consumers because of addrinuse
//TODO: probably we want to have the server in the editor (provider) so one or more plugins can consume

import { createConsumer, InputConsumerConfig, InputConsumer } from './consumer';

let inputConsumer: InputConsumer

export function getInputConsumer(): InputConsumer{
  if(!inputConsumer){
    inputConsumer = createConsumer(getConsumerConfig())
  }
  return inputConsumer
}

function getConsumerConfig(){
  return {log, port: 3001}
}

let log = console.log
export function setLogger(logger: (msg: string) => void){
  if(inputConsumer){
    inputConsumer.setLogger(logger)
  }
  log = logger
}