const test = require('tape')
const endOfStream = require('end-of-stream')
const PingStream = require('./ping.js')
const PongStream = require('./pong.js')


test('basic test', function(t){

  const sender = new PingStream()
  const reflector = new PongStream()

  sender.on('error', function(err){
    t.fail('saw error: '+err.stack)
  })

  sender.once('heartbeat', function(){
    sender.stop()
    t.pass('heard heartbeat')
    t.end()
  })

  sender.pipe(reflector).pipe(sender)

})


test('timeout test', function(t){

  const sender = new PingStream()

  sender.on('error', function(err){
    t.ok(err, 'saw timeout error')
    t.end()
  })

  sender.once('heartbeat', function(){
    sender.stop()
    t.fail('heard successful heartbeat instead of failing')
  })

  sender.resume()

})

test('dont send heartbeat until ready', function(t){

  let pollingPeriod = 200

  const sender = new PingStream({
    heartbeatPollingInterval: pollingPeriod,
  })
  let isReady = false

  sender.on('error', function(err){
    t.fail('saw error: '+err.stack)
  })

  function checkIfReady(){
    sender.stop()
    if (isReady) {
      t.pass('no heartbeats emitted until ready')
      t.end()
    } else {
      t.fail('sent heartbeat instead of waiting')  
    }
  }

  setTimeout(function(){
    t.pass('ping did not timeout')
    t.end()
  }, pollingPeriod*2)

})

test('works with end-of-stream', function(t){

  const sender = new PingStream()

  endOfStream(sender, function(){
    t.pass('end-of-stream saw ping failure')
    t.end()
  })

  sender.resume()

})

