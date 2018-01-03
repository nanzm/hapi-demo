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
    throw Boom.badRequest('You cannot request episode data without seasons. Please add extend=seasons to your request.')
  }

  if (queryParamsIncludeOnlySeasons(extendParams)) {
    return baseQuery.populate('seasons')
  }

  if (queryParamsIncludeSeasonsAndEpisodes(extendParams)) {
    return baseQuery.populate({path: 'seasons', populate: {path: 'episodes'}})
  }

  return baseQuery
}

const Handler = {
  index: {
    handler: async (request, h) => {
      const baseQuery = Show.find()
      const totalCount = await Show.count()
      const pagination = new Paginator(request, totalCount)

      if (pagination.currentPage > pagination.lastPage) {
        return Boom.notFound('The requested page does not exist. The last available page is: ' + pagination.lastPage)
      }

      let extendedQuery = extendQueryWithSeasonEpisodeData(baseQuery, request.query)

      const shows = await extendedQuery
        .skip(pagination.from)
        .limit(pagination.perPage)

      return h.response(shows).header('Link', pagination.link)
    },
    validate: {
      query: {
        page: Joi.number().min(1)
      }
    }
  },
  show: {
    handler: async (request, h) => {
      const slug = request.params.slug
      const baseQuery = Show.findOne({'ids.slug': slug})

      let extendedQuery = extendQueryWithSeasonEpisodeData(baseQuery, request.query)
      let show = await extendedQuery

      if (!show) {
        return Boom.notFound('Cannot find a show with that slug')
      }

      return show
    },
    validate: {
      params: {
        slug: Joi.string().required()
      }
    }
  }
}

module.exports = Handler
