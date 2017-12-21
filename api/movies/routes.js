'use strict'

const Handler = require('./handler')

const Routes = [
  {
    method: 'GET',
    path: '/movies',
    config: Handler.index
  },
  {
    method: 'GET',
    path: '/movies/{slug}',
    config: Handler.show
  }
]

module.exports = Routes
