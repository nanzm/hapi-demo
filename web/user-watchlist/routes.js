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
    path: '/watchlist/add/movie/{slug}',
    config: Handler.addMovie
  },
  {
    method: 'GET',
    path: '/watchlist/add/show/{slug}',
    config: Handler.addShow
  }
]

module.exports = Routes
