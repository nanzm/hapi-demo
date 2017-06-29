'use strict'

const Handler = {
  profile: {
    auth: 'session',
    handler: function (request, reply) {
      reply.view('profile')
    }
  }
}

module.exports = Handler
