'use strict'

const Routes = require('./routes')

function register (server, options) {
  server.route(Routes)
  server.log('info', 'Plugin registered: api-movies')
}

exports.plugin = {
  name: 'api-movies',
  version: '1.0.0',
  register
}
