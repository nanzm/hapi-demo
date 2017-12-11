'use strict'

function register (server, options) {
  // declare dependencies
  server.dependency(['authentication'])

  // decorate the request and pass responsibility to hapi
  // that no other plugin uses request.user
  server.decorate('request', 'user', {})

  server.ext('onPostAuth', (request, h) => {
    // user successfully authenticated?
    if (request.auth.isAuthenticated) {
      // add user object to request by using its credentials
      request.user = request.auth.credentials
    }

    // continue request lifecycle
    return h.continue
  })

  server.log('info', 'Plugin registered: add user to request')
}

exports.plugin = {
  name: 'add-user-to-request',
  version: '1.0.0',
  register
}
