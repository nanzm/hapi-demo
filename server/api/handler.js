'use strict'

const _ = require('lodash')
const Boom = require('boom')
const Path = require('path')
const Show = require(Path.resolve(__dirname, '..', 'models')).Show
const Movie = require(Path.resolve(__dirname, '..', 'models')).Movie

const Handler = {
  showsIndex: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function(request, reply) {
      // todo remove seasons property from request, otherwise the returning JSON is huge
      Show.find().then(shows => {
        return reply(shows)
      })
    }
  },
  showsSingle: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function(request, reply) {
      const slug = request.params.slug

      return Movie.findOne({ 'ids.slug': slug }).then(movie => {
        if (!movie) {
          return reply(Boom.notFound('Cannot find a show with that slug'))
        }

        return reply(movie)
      })
    }
  },
  moviesIndex: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function(request, reply) {
      Movie.find().then(movies => {
        return reply(movies)
      })
    }
  },
  moviesSingle: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function(request, reply) {
      const slug = request.params.slug

      return Movie.findOne({ 'ids.slug': slug }).then(movie => {
        if (!movie) {
          return reply(Boom.notFound('Cannot find a movie with that slug'))
        }

        return reply(movie)
      })
    }
  }

}

module.exports = Handler
