'use strict'

const _ = require('lodash')
const Boom = require('boom')
const Path = require('path')
const Show = require(Path.resolve(__dirname, '..', 'models')).Show
const Movie = require(Path.resolve(__dirname, '..', 'models')).Movie

const Handler = {
  index: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: async (request, h) => {
      const movies = await Movie.find()

      return movies
    }
  },
  show: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: async (request, h) => {
      const slug = request.params.slug
      const movie = await Movie.findOne({ 'ids.slug': slug })

      if (!movie) {
        return Boom.notFound('Cannot find a movie with that slug')
      }

      return movie
    }
  }
}

module.exports = Handler
