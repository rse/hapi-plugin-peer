
const HAPI       = require("@hapi/hapi")
const HAPIPeer   = require("./hapi-plugin-peer")
const Request    = require("request-promise")

;(async () => {
    const server = HAPI.server({
        host:  "127.0.0.1",
        port:  12345,
        debug: { request: [ "error" ] }
    })

    await server.register({
        plugin: HAPIPeer,
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
                strictHeader: true    /*  strict cookie value handling    */
            }
        }
    })

    server.route({
        method:  "GET",
        path:    "/foo",
        handler: async (request, reply) => {
            let peer = request.peer()
            return { peer: peer.toString() }
        }
    })
    await server.start()

    let response = await server.inject({
        method:  "GET",
        url:     "/foo"
    })
    if (typeof response.result.peer === "string")
        console.log("-- internal request: /foo: OK", response.result.peer)
    else
        console.log("-- internal request: /foo: ERROR: invalid response: ", response.result)

    response = await Request({ uri: "http://127.0.0.1:12345/foo", json: true })
    if (typeof response.peer === "string")
        console.log("-- external request: /foo: OK", response.peer)
    else
        console.log("-- external request: /foo: ERROR: invalid response: ", response)

    await server.stop({ timeout: 1000 })
    process.exit(0)
})().catch((err) => {
    console.log("ERROR", err)
})

