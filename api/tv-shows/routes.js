'use strict'

const Handler = require('./handler')

const Routes = [
  {
    method: 'GET',
    path: '/shows',
    config: Handler.index
  },
  {
    method: 'GET',
    path: '/shows/{slug}',
    config: Handler.show
  }
]

module.exports = Routes
