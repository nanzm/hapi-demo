'use strict'

const Boom = require('boom')
const Joi = require('joi')
const Path = require('path')
const Movie = require(Path.resolve(__dirname, '..', '..', 'models')).Movie
const Paginator = require(Path.resolve(__dirname, '..', '..', 'utils', 'paginator'))

const Handler = {
  index: {
    handler: async (request, h) => {
      const totalCount = await Movie.count()
      const pagination = new Paginator(request, totalCount)

      if (pagination.currentPage > pagination.lastPage) {
        return Boom.notFound(
          `The requested page does not exist. The last available page is: ${pagination.lastPage}`
        )
      }

      const movies = await Movie.find()
        .skip(pagination.from)
        .limit(pagination.perPage)

      return h.response(movies).header('Link', pagination.link)
    },
    tags: ['api'],
    validate: {
      query: {
        page: Joi.number().min(1)
      }
    }
  },

  show: {
    handler: async (request, h) => {
      const slug = request.params.slug
      const movie = await Movie.findOne({ 'ids.slug': slug })

      if (!movie) {
        return Boom.notFound('Cannot find a movie with that slug')
      }

      return movie
    },
    tags: ['api'],
    validate: {
      params: {
        slug: Joi.string().required()
      }
    }
  }
}

module.exports = Handler
