'use strict'

const User = require('../../models').User

async function register (server, options) {
  // declare dependencies to hapi auth plugins
  await server.register([
    {
      plugin: require('hapi-auth-cookie')
    }
  ])

  /**
   * Register cookie-based session auth to remember
   * the logged in user
   */
  server.auth.strategy('session', 'cookie', {
    redirectTo: '/login',
    password: 'ThisIsASecretPasswordForTheAuthCookie',
    appendNext: true, // appends the current URL to the query param "next". Set to a string to use a different query param name
    isSecure: process.env.NODE_ENV === 'production',
    validateFunc: async (request, session) => {
      // validate the existing session
      // we only store the user’s id within the session
      const userId = session.id

      // user lookup and return credentials if available
      // populate watchlist
      const user = await User.findById(userId).populate('watchlist')

      if (user) {
        return { credentials: user, valid: true }
      }

      return { credentials: null, valid: false }
    }
  })

  server.auth.default({
    mode: 'try',
    strategy: 'session'
  })
}

exports.plugin = {
  name: 'authentication',
  version: '1.0.0',
  register
}
