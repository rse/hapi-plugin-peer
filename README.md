
hapi-plugin-peer
================

[HAPI](http://hapijs.com/) plugin for network peer identification.

<p/>
<img src="https://nodei.co/npm/hapi-plugin-peer.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/hapi-plugin-peer.png" alt=""/>

Installation
------------

```shell
$ npm install hapi hapi-plugin-peer
```

About
-----

This is a very small plugin for the [HAPI](http://hapijs.com/) server
framework for network peer identification. It decorates the HAPI server
object with a `peer(request: Request): Peer` method and the HAPI request
object with a `peer(request?: Request): Peer` method. The method just
returns a Peer object of format `{ addr: String, port: Number, id?:
String }` which uniquely identifies the peer.

Usage
-----

```js
server.register({
    register: require("hapi-plugin-peer"),
    options: {
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
            strictHeader: true,   /*  strict cookie value handling    */
        }
    }
})
[...]
server.on("onRequest", (request, reply) => {
    let peer = request.peer()
    ....
})
server.route({
    method: "POST",
    path:   "/foo",
    config: {
        plugins: {
            websocket: {
                connect: (wss, ws) => {
                    let peer = server.peer(ws.upgradeReq)
                    ...
                },
                disconnect: (wss, ws) => {
                    let peer = server.peer(ws.upgradeReq)
                    ...
                }
            }
        }
    },
    handler: (request, reply) => {
        let peer = request.peer()
        ...
    }
})
```

License
-------

Copyright (c) 2017-2018 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

