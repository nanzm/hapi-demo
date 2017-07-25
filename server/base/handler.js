'use strict'

const Boom = require('boom')

const Handler = {
  index: {
    handler: function (request, reply) {
      reply.view('index', null, { layout: 'hero' })
    }
  },

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
      const accept = request.headers.accept

      if (accept && accept.match(/json/)) {
        return reply(Boom.notFound('Fuckity fuck, this resource isn’t available.'))
      }

      reply.view('404').code(404)
    }
  }
}

module.exports = Handler
