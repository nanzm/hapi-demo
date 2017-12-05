'use strict'

const Routes = require('./routes')

exports.register = (server, options, next) => {
  server.route(Routes)
  server.log('info', 'Plugin registered: API')

  next()
}

exports.register.attributes = {
  name: 'api',
  version: '1.0.0'
}
