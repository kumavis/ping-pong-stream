# PingStream and PongStream

[![Greenkeeper badge](https://badges.greenkeeper.io/kumavis/ping-pong-stream.svg)](https://greenkeeper.io/)

Most transport streams (e.g. websockets) can detect when they close.

Some can't (e.g. window.postMessage)! For those that can't, theres `ping-pong-stream`.

```js
const PingStream = require('ping-pong-stream/ping')
const PongStream = require('ping-pong-stream/pong')
const endOfStream = require('end-of-stream')

const pinger = new PingStream()
const ponger = new PongStream()

// ping and pong would normally be in different processes but...
pinger
.pipe(nonSelfClosingTransport)
.pipe(ponger)
.pipe(nonSelfClosingTransport)
.pipe(pinger)

endOfStream(pinger, function(){
  // the nonSelfClosingTransport has closed
})
```

### options

```js
// defaults shown
new PingStream({
  heartbeatPollingInterval: 1e3,
  heartbeatTimeout: 1e2,
  heartbeatRequest: 'ping',
  heartbeatResponse: 'pong',
})
```