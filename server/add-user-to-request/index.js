'use strict'

exports.register = (server, options, next) => {
  // declare dependencies
  server.dependency([ 'authentication' ])
  server.decorate('request', 'user', {})

  server.ext('onPostAuth', function (request, reply) {
    if (request.auth.isAuthenticated) {
      // add user object to response data and make it available to views
      // the "request.auth.credentials" object is set due to the validateFunc
      // within the "authentication" plugin
      request.user = request.auth.credentials
    }

    return reply.continue()
  })

  server.log('info', 'Plugin registered: add user to request')
  next()
}

exports.register.attributes = {
  name: 'add-user-to-request',
  version: '1.0.0'
}