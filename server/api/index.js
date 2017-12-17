'use strict'

const Routes = require('./routes')

function register (server, options) {
  server.route(Routes)
  server.log('info', 'Plugin registered: API')
}

exports.plugin = {
  name: 'api',
  version: '1.0.0',
  register
}
