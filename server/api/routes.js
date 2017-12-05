'use strict'

const Handler = require('./handler')

const Routes = [
  {
    method: 'GET',
    path: '/api/shows',
    config: Handler.showsIndex
  },
  {
    method: 'GET',
    path: '/api/shows/{slug}',
    config: Handler.showsSingle
  },
  {
    method: 'GET',
    path: '/api/movies',
    config: Handler.moviesIndex
  },
  {
    method: 'GET',
    path: '/api/movies/{slug}',
    config: Handler.moviesSingle
  }
]

module.exports = Routes
