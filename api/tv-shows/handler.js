'use strict'

const Boom = require('boom')
const Joi = require('joi')
const Path = require('path')
const Paginator = require(Path.resolve(__dirname, '..', '..', 'utils', 'paginator'))
const Show = require(Path.resolve(__dirname, '..', '..', 'models')).Show

const queryParamEpisodes = 'episodes'
const queryParamSeasons = 'seasons'

function hasSeasonsOnly (extendParams) {
  return !extendParams.includes(queryParamEpisodes) && extendParams.includes(queryParamSeasons)
}

function hasSeasonsAndEpisodes (extendParams) {
  return extendParams.includes(queryParamEpisodes) && extendParams.includes(queryParamSeasons)
}

function getPopulationOptions (extend = '') {
  if (hasSeasonsAndEpisodes(extend)) {
    return { path: 'seasons', populate: { path: 'episodes' } }
  }

  if (hasSeasonsOnly(extend)) {
    return { path: 'seasons' }
  }

  return {}
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

      const options = getPopulationOptions(request.query.extend)

      const shows = await Show.find()
        .populate(options)
        .skip(pagination.from)
        .limit(pagination.perPage)

      return h.response(shows).header('Link', pagination.link)
    },
    description: 'Get List of TV Shows',
    notes:
      'Returns a list of TV shows. You can paginate through the list with the page parameter. You can request to enhance the returned model with more information by passing the extend query parameter.',
    tags: ['api', 'TV shows'],
    validate: {
      query: {
        page: Joi.number()
          .integer()
          .min(1)
          .default('1'),
        extend: Joi.string()
          .valid(['seasons', 'seasons,episodes'])
          .description('Extend the return models by seasons or seasons and episodes.')
      }
    }
  },

  show: {
    handler: async (request, h) => {
      const slug = request.params.slug
      const options = getPopulationOptions(request.query.extend)
      const show = await Show.findOne({ 'ids.slug': slug }).populate(options)

      if (!show) {
        return Boom.notFound('Cannot find a show with that slug')
      }

      return show
    },
    description: 'Get TV Show by Slug',
    notes: 'Returns a TV show based on a passed slug.',
    tags: ['api', 'TV shows'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: Joi.object({
              title: 'Game of Thrones',
              year: 2011,
              overview:
                "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night's Watch, is all that stands between the realms of men and the icy horrors beyond.",
              first_aired: '2011-04-18T01:00:00.000Z',
              runtime: 60,
              certification: 'TV-MA',
              network: 'HBO',
              country: 'us',
              trailer: 'http://youtube.com/watch?v=giYeaKsXnsI',
              homepage: 'http://www.hbo.com/game-of-thrones',
              status: 'returning series',
              rating: 9.36794,
              votes: 64187,
              language: 'en',
              aired_episodes: 67
            }).label('Result')
          },
          '404': {
            description: 'Bad Request',
            schema: Joi.object({
              statusCode: 404,
              error: 'Not Found',
              message: 'Cannot find a show with that slug'
            }).label('Error for unknown slug')
          }
        }
      }
    },
    validate: {
      params: {
        slug: Joi.string()
          .required()
          .default('game-of-thrones')
      },
      query: {
        extend: Joi.string()
          .valid(['seasons', 'seasons,episodes'])
          .description('Extend the return model by seasons or seasons and episodes.')
      }
    }
  }
}

module.exports = Handler
