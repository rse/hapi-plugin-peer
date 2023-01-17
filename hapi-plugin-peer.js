/*
**  hapi-plugin-peer -- HAPI plugin for network peer identification
**  Copyright (c) 2017-2023 Dr. Ralf S. Engelschall <rse@engelschall.com>
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

/*  external dependencies  */
const hoek    = require("@hapi/hoek")
const UUID    = require("pure-uuid")

/*  internal dependencies  */
const pkg     = require("./package.json")

/*  determine the peer identification (<address>:<port>) for a HAPI request  */
const peerOfRequest = (options, request) => {
    /*  sanity check argument  */
    if (typeof request !== "object")
        throw new Error("invalid Request object")

    /*  create a peer identification  */
    class Peer {
        constructor () {
            this.addr = "0.0.0.0"
            this.port = 0
            if (options.peerId)
                this.id = "00000000-0000-0000-0000-000000000000"
        }
        toString () {
            let str = `${this.addr}:${this.port}`
            if (options.peerId)
                str = `${this.id}@${str}`
            return str
        }
    }
    const peer = new Peer()

    /*  fetch the peer id  */
    if (   options.peerId
        && typeof request.info === "object"
        && request.info !== null
        && request.info.peerId             )
        peer.id = request.info.peerId

    /*  fetch the address/port:
        attempt 1: via high-level HAPI information
        (usually for HAPI standard request objects)  */
    if (   typeof request.info === "object"
        && request.info !== null
        && request.info.remoteAddress
        && request.info.remotePort         ) {
        peer.addr = request.info.remoteAddress
        peer.port = request.info.remotePort
    }

    /*  fetch the address/port:
        attempt 2: via low-level Socket information
        (usually for WebSocket upgrade request objects)  */
    if (   peer.addr === "0.0.0.0"
        && peer.port === 0
        && typeof request.socket === "object"
        && request.socket !== null
        && request.socket.remoteAddress
        && request.socket.remotePort         ) {
        peer.addr = request.socket.remoteAddress
        peer.port = request.socket.remotePort
    }

    return peer
}

/*  the HAPI plugin register function  */
const register = async (server, options) => {
    /*  determine plugin registration options  */
    options = hoek.applyToDefaults({
        peerId:     false,
        cookieName: "PEERID",
        cookieOptions: {
            ttl:          null,   /*  session time-life               */
            isSecure:     false,  /*  control cookie flag "Secure"    */
            isHttpOnly:   false,  /*  control cookie flag "HttpOnly"  */
            isSameSite:   "Lax",  /*  control cookie flag "SameSite"  */
            path:         "/",    /*  cookie validity path            */
            domain:       null,   /*  cookie validity domain          */
            encoding:     "none", /*  cookie value encoding           */
            strictHeader: true    /*  strict cookie value handling    */
        }
    }, options, { nullOverride: true })

    /*  support peer unique identification  */
    if (options.peerId) {
        /*  pre-configure peer id cookie  */
        server.state(options.cookieName, options.cookieOptions)

        /*  hook into the early request processing  */
        server.ext("onPreAuth", async (request, h) => {
            /*  check for existing peer id  */
            let peerId = request.state[options.cookieName]
            if (peerId === undefined) {
                /*  generate a new peer id  */
                peerId = (new UUID(1)).format()

                /*  remember that we have to send it to the peer  */
                if (request.plugins.peer === undefined)
                    request.plugins.peer = {}
                request.plugins.peer.sendPeerId = true
            }

            /*  provide result  */
            request.info.peerId = peerId
            return h.continue
        })

        /*  hook into the late request processing  */
        server.ext("onPreResponse", async (request, h) => {
            /*  send a new generated id to the peer  */
            if (request.plugins.peer && request.plugins.peer.sendPeerId) {
                const peerId = request.info.peerId
                h.state(options.cookieName, peerId)
            }
            return h.continue
        })
    }

    /*  decorate the server object  */
    server.decorate("server", "peer", (request) => {
        return peerOfRequest(options, request)
    })

    /*  decorate the request object  */
    server.decorate("request", "peer", (requestImplicit) => {
        return (requestExplicit) =>
            peerOfRequest(options, requestExplicit ? requestExplicit : requestImplicit)
    }, { apply: true })
}

/*  export register function, wrapped in a plugin object  */
module.exports = {
    plugin: {
        register: register,
        pkg:      pkg
    }
}

