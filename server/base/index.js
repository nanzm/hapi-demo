'use strict'

const Routes = require('./routes')

exports.register = (server, options, next) => {
  server.dependency([ 'vision' ])

  server.route(Routes)
  server.log('info', 'Plugin registered: assets')

  next()
}

exports.register.attributes = {
  name: 'assets',
  version: '1.0.0'
}
