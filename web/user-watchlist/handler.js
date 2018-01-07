'use strict'

const Joi = require('joi')
const Path = require('path')
const Models = require(Path.resolve(__dirname, '..', '..', 'models'))
const Show = Models.Show
const Movie = Models.Movie
const Watchlist = Models.Watchlist
const ErrorExtractor = require(Path.resolve(__dirname, '..', '..', 'utils', 'error-extractor'))

const Handler = {
  watchlist: {
    auth: 'session',
    handler: (request, h) => {
      return h.view('user/watchlist', { watchlist: request.user.watchlist })
    }
  },

  add: {
    auth: 'session',
    handler: async (request, h) => {
      const slug = request.params.slug
      const movie = await Movie.findOne({ 'ids.slug': slug })
      const show = !movie ? await Show.findOne({ 'ids.slug': slug }) : null
      const noMovieNorShow = !movie && !show

      let watchlist = request.user.watchlist

      if (noMovieNorShow) {
        return h.view('user/watchlist', {
          error: `We can’t find a movie or show for the given slug »${slug}«. Nothing added to your watchlist.`,
          watchlist
        })
      }

      // create new watchlist if user didn't have one yet
      if (!watchlist) {
        watchlist = new Watchlist({
          user: request.user._id,
          movies: [],
          shows: []
        })
      }

      // add movie and show to watchlist
      // document methods handle empty value properly (undefined, null)
      watchlist.addMovie(movie)
      watchlist.addShow(show)
      await watchlist.save()

      // Mongoose's "post save" hook doesn't support population yet
      // that means you need to query the data again to populate relations
      watchlist = await Watchlist.findById(watchlist._id)

      return h.view('user/watchlist', { watchlist })
    },
    validate: {
      params: {
        slug: Joi.string().trim()
      },
      failAction: (request, h, error) => {
        // prepare formatted error object
        const errors = ErrorExtractor(error)

        return h
          .view('user/watchlist', {
            errors
          })
          .code(400)
          .takeover()
      }
    }
  }
}

module.exports = Handler
