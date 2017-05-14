
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
object with a `peer(request: Request): String` method and the HAPI
request object with a `peer(request?: Request): String` method. The
method just returns a string of format `<address>:<port>` which can be
used to uniquely identify the direct network peer (the client or an
intermediate proxy connecting to the server).

Usage
-----

```js
server.register(require("hapi-plugin-peer"))
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

Copyright (c) 2017 Ralf S. Engelschall (http://engelschall.com/)

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

