'use strict'

const Handler = require('./handler')

const Routes = [
  {
    method: 'GET',
    path: '/',
    config: Handler.index
  },
  {
    method: 'GET',
    path: '/js/{path*}',
    config: Handler.js
  },
  {
    method: 'GET',
    path: '/css/{path*}',
    config: Handler.css
  },
  {
    method: 'GET',
    path: '/images/{path*}',
    config: Handler.images
  }
]

module.exports = Routes
