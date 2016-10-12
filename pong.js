const Duplex = require('readable-stream').Duplex
const inherits = require('util').inherits

module.exports = PongStream

inherits(PongStream, Duplex)

function PongStream (opts) {
  const self = this
  opts = opts || {}
  Duplex.call(this, opts)
  self._heartbeatRequest = opts.heartbeatRequest || 'ping'
  self._heartbeatResponse = opts.heartbeatResponse || 'pong'
}

// private

PongStream.prototype._sendResponse = function (msg) {
  const self = this
  self.push(self._heartbeatResponse)
}

// stream plumbing

PongStream.prototype._read = noop

PongStream.prototype._write = function (msg, encoding, cb) {
  const self = this
  if (msg.toString() === self._heartbeatRequest.toString()) {
    // heartbeat heard
    self._sendResponse()
    cb()
  } else {
    // unknown message
    cb(new Error('PongStream - unknown request'))
  }
  
}

// util

function noop() {}