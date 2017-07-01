'use strict'

const Boom = require('boom')

const Handler = {
  css: {
    handler: {
      directory: { path: './public/css' }
    }
  },

  js: {
    handler: {
      directory: { path: './public/js' }
    }
  },

  images: {
    handler: {
      directory: { path: './public/images' }
    }
  },

  missing: {
    handler: (request, reply) => {
      const accept = request.raw.req.headers.accept

      // take priority: check header if there’s a JSON REST request
      if (accept && accept.match(/json/)) {
        return reply(Boom.notFound('Fuckity fuck, this resource isn’t available.'))
      }

      return reply.view('404').code(404)
    }
  }
}

module.exports = Handler
