'use strict'

const Boom = require('boom')

const Handler = {
  index: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      reply.view('index', null, { layout: 'hero' })
    }
  },

  css: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: {
      directory: { path: './public/css' }
    }
  },

  js: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: {
      directory: { path: './public/js' }
    }
  },

  images: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: {
      directory: { path: './public/images' }
    }
  },

  missing: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
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
