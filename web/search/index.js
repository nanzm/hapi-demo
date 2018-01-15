'use strict'

const Routes = require('./routes')

function register (server, options) {
  server.dependency(['vision'])

  server.route(Routes)
  server.log('info', 'Plugin registered: search')
}

exports.plugin = {
  name: 'search',
  version: '1.0.0',
  register
}
