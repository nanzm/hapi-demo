'use strict'

const Routes = require('./routes')

function register (server, options) {
  server.route(Routes)
  server.log('info', 'Plugin registered: API user')
}

exports.plugin = {
  name: 'api-user',
  version: '1.0.0',
  register
}
