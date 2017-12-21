'use strict'

const Boom = require('boom')
const User = require('./../models').User

async function register (server, options) {
  // declare dependencies to hapi auth plugins
  await server.register([
    {
      plugin: require('hapi-auth-cookie')
    },
    {
      plugin: require('hapi-auth-basic')
    }
    // {
    //   register: require('bell')
    // }
  ])

  /**
   * Basic authentication strategy for username and password
   */
  server.auth.strategy('basic', 'basic', {
    validate: async (request, email, password) => {
      try {
        const user = await User.findByEmail(email)

        if (!user) {
          throw Boom.notFound('There is no user with the given email address')
        }

        await user.comparePassword(password)

        return { credentials: user, isValid: true }
      } catch (err) {
        throw err
      }
    }
  })

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
      const user = await User.findById(userId)

      if (user) {
        return { credentials: user, valid: true }
      }

      return { credentials: null, valid: false }
    }
  })

  /**
   * trakt.tv OAuth config
   */
  // const uri = 'https://api.trakt.tv'
  // const user = uri + '/users/me'

  // server.auth.strategy('trakt', 'bell', {
  //   provider: {
  //     protocol: 'oauth2',
  //     auth: uri + '/oauth/authorize',
  //     token: uri + '/oauth/token',
  //     headers: {
  //       'trakt-api-version': 2,
  //       'trakt-api-key': process.env.TRAKT_CLIENT_ID
  //     },
  //     profile: function (credentials, params, get, callback) {
  //       const query = { extended: 'full' }

  //       get(user, query, profile => {
  //         credentials.profile = profile
  //         return callback()
  //       })
  //     }
  //   },
  //   password: 'ThisIsASecretCookiePasswordForTrakt',
  //   clientId: process.env.TRAKT_CLIENT_ID,
  //   clientSecret: process.env.TRAKT_CLIENT_SECRET,
  //   isSecure: process.env.NODE_ENV === 'production'
  // })

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
