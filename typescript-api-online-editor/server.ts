import * as fs from 'fs'
import http from 'http'

//(process as any).isDevelopment = true

//function readFileSync(name){
  //if((process as any).isDevelopment){
//    return fs.readFileSync
  //}
//}

function onRequest(request, response) {
  const readFileSync = require('fs').readFileSync
  const fn = eval(` ( ${readFileSync('./serverEval.ts').toString()} )`)
  fn(request, response, readFileSync)
}
http.createServer(onRequest).listen(process.env.PORT)
