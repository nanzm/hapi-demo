'use strict'

const Routes = require('./routes')

function register (server, options) {
  server.route(Routes)
  server.log('info', 'Plugin registered: API TV shows')
}

exports.plugin = {
  name: 'api-tv-shows',
  version: '1.0.0',
  register
}
