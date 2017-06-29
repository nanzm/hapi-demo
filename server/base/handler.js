'use strict'

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
      return reply.view('404').code(404)
    }
  }
}

module.exports = Handler
