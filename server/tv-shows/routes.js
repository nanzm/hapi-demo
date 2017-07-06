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
    path: '/shows/trending',
    config: Handler.trending
  },
  {
    method: 'GET',
    path: '/shows/popular',
    config: Handler.popular
  },
  {
    method: 'GET',
    path: '/shows/{slug}',
    config: Handler.single
  }
]

module.exports = Routes
