'use strict'

const Joi = require('joi')
const Boom = require('boom')
const Path = require('path')
const Models = require(Path.resolve(__dirname, '..', 'models'))
const Show = Models.Show
const Movie = Models.Movie
const Watchlist = require(Path.resolve(__dirname, '..', 'models')).Watchlist
const ErrorExtractor = require(Path.resolve(__dirname, '..', 'utils', 'error-extractor'))

const Handler = {
  watchlist: {
    auth: 'session',
    handler: (request, h) => {
      return h.view('user/watchlist', {
        watchlist: request.user.watchlist
      })
    }
  },

  add: {
    auth: 'session',
    handler: async (request, h) => {
      const slug = request.params.slug
      const movie = await Movie.findOne({ 'ids.slug': slug })
      const show = !movie ? await Show.findOne({ 'ids.slug': slug }) : null

      let watchlist = await Watchlist.findOne({ user: request.user._id })

      if (!watchlist) {
        watchlist = new Watchlist({
          user: request.user._id,
          movies: [],
          shows: []
        })
      }

      if (movie && !watchlist.includesMovie(movie)) {
        watchlist.movies.push(movie)
      }

      if (show && !watchlist.includesShow(show)) {
        watchlist.shows.push(show)
      }

      await watchlist.save()

      return h.view('user/watchlist', {
        message: 'Perfect!',
        watchlist
      })
    },
    validate: {
      params: {
        slug: Joi.string().trim()
      },
      failAction: (request, h, error) => {
        // prepare formatted error object
        const errors = ErrorExtractor(error)

        // grab incoming payload values
        const { username, homepage } = request.payload

        // merge existing user data with incoming values
        const user = Object.assign(request.user, { username, homepage })

        return h
          .view('user/watchlist', {
            user,
            errors
          })
          .code(400)
          .takeover()
      }
    }
  }
}

module.exports = Handler
