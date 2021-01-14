const { createWriteStream: wStream, createReadStream: rStream,  promises: fsAsync } = require('fs')
const { join: joinPath, parse: parsePath, sep } = require('path')
const { inherits } = require('util')
const { duplex, Transform, pipeline } = require('stream')
const http = require('http')
const assert = require('assert')
const { parse: qsParser } = require('querystring')
const { pathToFileURL: path2file, fileURLToPath: file2path } = require('url')

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const { Router } = require('../Router')
const { ResponseHeaders } = require('../ResponseHeaders')
const DataStream = require('../DataStream')
const tx_BodyParser = require('../../lib/TransactionStreams/tx_BodyParser')


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const http_server = http.createServer()

//  Import predefined server configurations
http_server.cfg = require('../../cfg/http_server.json')
const { ERROR_EVENT, INFO_EVENT, HEADER_IS_SET, CLIENT_READY_RESPONSE_STREAM, CLIENT_ERROR_RESPONSE } = http_server.cfg['evt']

//  CUSTOM Event handler - HEADER-IS-SET, bound to ResponseHeaders instance
http_server.on(HEADER_IS_SET, (k, v) => {
    console.log(`[i] [${ new Date().toLocaleTimeString() }] :: Header: ${ k } is set to: ${ v }.`)
})

//  Event handler - Error
http_server.on('error', err => {
    console.warn(`
    [!] [${ new Date().toLocaleTimeString() }] [ SYSTEM-EVENT-ERROR ]
        -> ${ err.name}  ${ err.code }
        -> DESCRIPTION: ${ err.message }
        ->    LOCATION: ${ err.stack }
    \n`)
})

http_server.on(INFO_EVENT, msg => {
    console.warn(`
    [i] [INFO] [${ new Date().toLocaleTimeString() }] [ SYSTEM-EVENT-INFO-MESSAGE ]
        MESSAGE: ${ msg }
    \n`)
})


//  Event handler - Listening
http_server.on('listening', () => {
    console.info(`
     [i] [${ new Date().toLocaleTimeString() }] [ SYSTEM-EVENT-HTTP-SERVER-UP  ]
        -> STATUS: Web Service has started.
        ->    URL: ${ http_server.cfg.url }
    \n`)
})

// Event handler = Close
http_server.on('close', () => {
   console.info(`
   [i] [ ${ new Date().toLocaleTimeString() }] [ SYSTEM-EVENT-CLOSE ]
        -> DESCRIPTION: Server connection has closed.
        ->         URL: ${ http_server.cfg.url }
        \n`)
})

function eventEmitterProxy(k, v) {

let _proxyEmitters = {
   
    hdrSetEmit(k, v) {
        return http_server.emit(HEADER_IS_SET, k, v)
    },
    errorEmit(err) {
        return http_server.emit('error', err)
    },
    infoEmit(msg) {
        return http_server.emit(INFO_EVENT, msg)
    },
    rddRspnseEmit(stream) {
        return http_server.emit(CLIENT_READY_RESPONSE_STREAM)
    },
    clErrResponse(code, err) {
        return http_server.emit(CLIENT_ERROR_RESPONSE)
    }
}
    return _proxyEmitters
}

//  Event Handler - GET
http_server.on('GET', (request, response) => {
    _router
    http_server.emit(INFO_EVENT, `GET-EVENT_HANDLER Called`)
  
    http_server.emit(CLIENT_READY_RESPONSE_STREAM, { _stream: `<h1>More Spork with Pork, but less spam in my ham.</h1>`, _statusCode: 200, _contentType: 'text/html' })
    
    
    
})

//  Event Handler - POST
http_server.on('POST', (request, response) => {

})

// Event Handler - PUT
http_server.on('PUT', (request, response) => {

})

//  Event Handler - DELETE
http_server.on('DELETE', (request, response) => {

})


// Event handler - Connection
http_server.on('connection', c => {
    let _CLIENT = new URL(`http://${ c.remoteAddress }:${ c.remotePort }`)
    http_server.emit(INFO_EVENT, `New Connection from CLIENT: ${ _CLIENT.origin }`)
    //  Event Handler - request
    http_server.on('request', (request, response) => {
        let { url: reqUrl, headers: reqHeaders, method: reqMethod } = request
        let proxyEmitter = eventEmitterProxy()
        let _router = new Router(request, response, proxyEmitter.errorEmit.bind(this), proxyEmitter.infoEmit.bind(this), proxyEmitter.rddRspnseEmit.bind(this), proxyEmitter.clErrResponse.bind(this))
        let _response_headers = new ResponseHeaders('_response_headers_', proxyEmitter.hdrSetEmit.bind(this))
       
        
       
        
        
       
        
        //  Event-Handler (Singleton) - Sends html error page to remote connected client
        http_server.once(CLIENT_ERROR_RESPONSE, (err) => {
        
        })
        
        //  Event Handler (Singleton) - Response Ready (Read Stream Instance)
        http_server.once(CLIENT_READY_RESPONSE_STREAM, ({ _stream, _statusCode, _contentType }) => {
            http_server.emit(INFO_EVENT, `CLIENT_READY_RESPONSE_HANDLER called. PRC: STREAM: ${ _stream }, HEADERS: status: ${ _statusCode }, content: ${ _contentType }`)
            
            _response_headers.assign('statusCode', _statusCode)
            _response_headers.assign('contentType', _contentType)
            _response_headers.assign('accessControlAllowOrigin', _CLIENT.origin)
            let { statusCode, headers } = _response_headers.buildHeaders()
           return (
            response.writeHead(statusCode, headers),
            response.write(_stream, (fail) => !fail
             ? http_server.emit(INFO_EVENT, `Response was successful`)
             : http_server.emit(INFO_EVENT, `Response had failed`)),
            response.end('boing')
        )
            
            
        })
        http_server.emit(reqMethod, request, response)
    })
})

//  Main Export = http_server
module.exports = { http_server }