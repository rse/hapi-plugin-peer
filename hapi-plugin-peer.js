/*
**  hapi-plugin-peer -- HAPI plugin for network peer identification
**  Copyright (c) 2017 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  internal dependencies  */
var Package = require("./package.json")

/*  determine the peer identification (<address>:<port>) for a HAPI request  */
const peerOfRequest = (request) => {
    let peer

    /*  sanity check argument  */
    if (typeof request !== "object")
        throw new Error("invalid Request object")

    /*  attempt 1: via high-level HAPI information
        (usually for HAPI standard request objects)  */
    if (   peer === undefined
        && typeof request.info === "object"
        && request.info.remoteAddress
        && request.info.remotePort         )
        peer = `${request.info.remoteAddress}:${request.info.remotePort}`

    /*  attempt 2: via low-level Socket information
        (usually for WebSocket upgrade request objects)  */
    if (   peer === undefined
        && typeof request.socket === "object"
        && request.socket.remoteAddress
        && request.socket.remotePort         )
        peer = `${request.socket.remoteAddress}:${request.socket.remotePort}`

    /*  fallback peer identifier  */
    if (peer === undefined)
        peer = "0.0.0.0:0"

    return peer
}

/*  the HAPI plugin register function  */
var register = function (server, options, next) {
    /*  decorate the server object  */
    server.decorate("server", "peer", (request) => {
        return peerOfRequest(request)
    })

    /*  decorate the request object  */
    server.decorate("request", "peer", (requestImplicit) => {
        return (requestExplicit) => {
            if (requestExplicit)
                peerOfRequest(requestExplicit)
            else
                peerOfRequest(requestImplicit)
        }
    }, { apply: true })

    /*  continue processing  */
    next()
}

/*  provide meta-information as expected by HAPI  */
register.attributes = { pkg: Package }

/*  export register function, wrapped in a plugin object  */
module.exports = { register: register }

