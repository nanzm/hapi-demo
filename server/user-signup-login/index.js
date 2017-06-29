'use strict'

const Routes = require('./routes')

exports.register = (server, options, next) => {
  server.dependency([ 'vision' ])

  server.route(Routes)
  server.log('info', 'Plugin registered: handle failed validations in failAction')

  next()
}

exports.register.attributes = {
  name: 'handle-failed-validations-in-failAction',
  version: '1.0.0'
}
