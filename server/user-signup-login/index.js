'use strict'

const Routes = require('./routes')

exports.register = (server, options, next) => {
  server.dependency([ 'vision' ])

  server.route(Routes)
  server.log('info', 'Plugin registered: user signup, login, password reset')

  next()
}

exports.register.attributes = {
  name: 'user-signup-login-password-reset',
  version: '1.0.0'
}
