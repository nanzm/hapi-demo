'use strict'

exports.register = (server, options, next) => {
  // declare dependencies
  server.dependency([ 'authentication' ])

  // decorate the request and pass responsibility to hapi
  // that no other plugin uses request.user
  server.decorate('request', 'user', {})

  server.ext('onPostAuth', function (request, reply) {
    // user successfully authenticated?
    if (request.auth.isAuthenticated) {
      // add user object to request by using its credentials
      request.user = request.auth.credentials
    }

    // continue request lifecycle
    return reply.continue()
  })

  server.log('info', 'Plugin registered: add user to request')
  next()
}

exports.register.attributes = {
  name: 'add-user-to-request',
  version: '1.0.0'
}
