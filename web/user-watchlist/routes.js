'use strict'

const Handler = require('./handler')

const Routes = [
  {
    method: 'GET',
    path: '/watchlist',
    config: Handler.index
  },
  {
    method: 'GET',
    path: '/watchlist/add/{slug}',
    config: Handler.add
  },
  {
    method: 'POST',
    path: '/watchlist/{slug}',
    config: Handler.add
  }
]

module.exports = Routes
