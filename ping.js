const Duplex = require('readable-stream').Duplex
const inherits = require('util').inherits

module.exports = PingStream

inherits(PingStream, Duplex)

function PingStream (opts) {
  const self = this
  opts = opts || {}
  Duplex.call(this, opts)
  self._heartbeatPollingInterval = opts.heartbeatPollingInterval || 1e3
  self._heartbeatTimeout = opts.heartbeatTimeout || 1e2
  self._heartbeatRequest = opts.heartbeatRequest || 'ping'
  self._heartbeatResponse = opts.heartbeatResponse || 'pong'
  self._heartbeatIsActive = false
  self._failureTimeoutId = undefined
  self._heartbeatTimeoutId = undefined
}

PingStream.prototype.stop = function () {
  const self = this
  clearTimeout(self._failureTimeoutId)
  clearTimeout(self._heartbeatTimeoutId)
}

// private

PingStream.prototype._sendHeartbeat = function () {
  const self = this
  if (self._heartbeatIsActive) return
  self._heartbeatIsActive = true
  self._failureTimeoutId = setTimeout(self._heartbeatFail.bind(self), self._heartbeatTimeout)
  self.push(self._heartbeatRequest)
}

PingStream.prototype._heartbeatFail = function () {
  const self = this
  self.emit('error', new Error('PingStream - did not hear pingback'))
}

PingStream.prototype._heartbeatSuccess = function () {
  const self = this
  self._heartbeatIsActive = false
  clearTimeout(self._failureTimeoutId)
  delete self._failureTimeoutId
  self._heartbeatTimeoutId = setTimeout(self._sendHeartbeat.bind(self), self._heartbeatPollingInterval)
  self.emit('heartbeat')
}

// stream plumbing

PingStream.prototype._read = function(){
  const self = this
  self._sendHeartbeat()
}

PingStream.prototype._write = function (msg, encoding, cb) {
  const self = this
  if (msg.toString() === self._heartbeatResponse.toString()) {
    // heartbeat heard
    self._heartbeatSuccess()
    cb()
  } else {
    // unknown message
    self.stop()
    cb(new Error('PingStream - unknown response'))
  }
  
}