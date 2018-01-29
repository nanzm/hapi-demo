'use strict'

const Boom = require('boom')
const Joi = require('joi')
const Path = require('path')
const Paginator = require(Path.resolve(__dirname, '..', '..', 'utils', 'paginator'))
const Show = require(Path.resolve(__dirname, '..', '..', 'models')).Show

const queryParamEpisodes = 'episodes'
const queryParamSeasons = 'seasons'

function queryParamsIncludeOnlyEpisodes (extendParams) {
  return extendParams.includes(queryParamEpisodes) && !extendParams.includes(queryParamSeasons)
}

function queryParamsIncludeOnlySeasons (extendParams) {
  return !extendParams.includes(queryParamEpisodes) && extendParams.includes(queryParamSeasons)
}

function queryParamsIncludeSeasonsAndEpisodes (extendParams) {
  return extendParams.includes(queryParamEpisodes) && extendParams.includes(queryParamSeasons)
}

function extendQueryWithSeasonEpisodeData (baseQuery, queryParams) {
  const extendParams = queryParams && queryParams.extend ? queryParams.extend : ''

  if (queryParamsIncludeOnlyEpisodes(extendParams)) {
    throw Boom.badRequest(
      'You cannot request episode data without seasons. Please add extend=seasons to your request.'
    )
  }

  if (queryParamsIncludeOnlySeasons(extendParams)) {
    return baseQuery.populate('seasons')
  }

  if (queryParamsIncludeSeasonsAndEpisodes(extendParams)) {
    return baseQuery.populate({ path: 'seasons', populate: { path: 'episodes' } })
  }

  return baseQuery
}

const Handler = {
  index: {
    handler: async (request, h) => {
      const totalCount = await Show.count()
      const pagination = new Paginator(request, totalCount)

      if (pagination.currentPage > pagination.lastPage) {
        return Boom.notFound(
          `The requested page does not exist. The last available page is: ${pagination.lastPage}`
        )
      }

      const baseQuery = Show.find()
      const extendedQuery = extendQueryWithSeasonEpisodeData(baseQuery, request.query)

      const shows = await extendedQuery.skip(pagination.from).limit(pagination.perPage)

      return h.response(shows).header('Link', pagination.link)
    },
    description: 'Get List of TV Shows',
    notes: 'Returns a list of TV shows. You can paginate through the list with the page parameter. You can request to enhance the returned model with more information by passing the extend query parameter.',
    tags: ['api', 'TV shows'],
    validate: {
      query: {
        page: Joi.number().integer().min(1).default('1'),
        extend: Joi.string().default('seasons,episodes').description('Extend the return model by seasons or seasons and episodes.')
      }
    }
  },

  show: {
    handler: async (request, h) => {
      const slug = request.params.slug
      const baseQuery = Show.findOne({ 'ids.slug': slug })

      const extendedQuery = extendQueryWithSeasonEpisodeData(baseQuery, request.query)
      const show = await extendedQuery

      if (!show) {
        return Boom.notFound('Cannot find a show with that slug')
      }

      return show
    },
    description: 'Get TV Show by Slug',
    notes: 'Returns a TV show based on a passed slug.',
    tags: ['api', 'TV shows'],
    validate: {
      params: {
        slug: Joi.string().required().default('game-of-thrones')
      },
      query: {
        extend: Joi.string().default('seasons,episodes').description('Extend the return model by seasons or seasons and episodes.')
      }
    }
  }
}

module.exports = Handler
