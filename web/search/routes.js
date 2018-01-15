'use strict'

const Handler = require('./handler')

const Routes = [
  {
    method: 'POST',
    path: '/search',
    config: Handler.search
  }
]

module.exports = Routes
