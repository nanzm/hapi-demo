'use strict'

const Handler = {
  index: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      reply.view('movies/index', {

      })
    }
  },

  single: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      reply.view('movies/single', {
        title: 'A Monster Calls',
        year: 2016,
        rating: 'PG13'
      })
    }
  }
}

module.exports = Handler
