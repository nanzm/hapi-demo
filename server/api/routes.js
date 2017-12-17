'use strict'

const Handler = require('./handler')

const Routes = [
  {
    method: 'GET',
    path: '/shows',
    config: Handler.showsIndex
  },
  {
    method: 'GET',
    path: '/shows/{slug}',
    config: Handler.showsSingle
  },
  {
    method: 'GET',
    path: '/movies',
    config: Handler.moviesIndex
  },
  {
    method: 'GET',
    path: '/movies/{slug}',
    config: Handler.moviesSingle
  }
]

module.exports = Routes
