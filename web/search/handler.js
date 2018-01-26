'use strict'

const Joi = require('joi')
const Path = require('path')
const Models = require(Path.resolve(__dirname, '..', '..', 'models'))
const Show = Models.Show
const Movie = Models.Movie
const ErrorExtractor = require(Path.resolve(__dirname, '..', '..', 'utils', 'error-extractor'))

const Handler = {
  search: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: async (request, h) => {
      const keyword = request.payload.keyword

      // find movies and shows based on the user input
      const [movies, shows] = await Promise.all([
        Movie.find(
          {
            $text: { $search: keyword }
          },
          { score: { $meta: 'textScore' } }
        ).limit(5),
        // .sort({
        //   score: { $meta: 'textScore' }
        // }),
        Show.find(
          {
            $text: { $search: keyword }
          },
          { score: { $meta: 'textScore' } }
        ).limit(5)
        // .sort({
        //   score: { $meta: 'textScore' }
        // }),
      ])

      // merge result arrays for movies and shows
      // and sort by search score
      const results = movies.concat(shows).sort((a, b) => {
        // sort by score DESC
        // score is only available on the _doc attribute,
        // because the document itself doesn’t have that attribute
        return b._doc.score - a._doc.score
      })

      return h.view('search/index', { results, keyword })
    },
    validate: {
      payload: {
        keyword: Joi.string()
          .trim()
          .allow('')
      },
      failAction: (request, h, error) => {
        // prepare formatted error object
        const errors = ErrorExtractor(error)

        return h
          .view('search/index', {
            errors
          })
          .code(400)
          .takeover()
      }
    }
  }
}

module.exports = Handler
