'use strict'

const Hoek = require('hoek')
const Boom = require('boom')
const User = require('./../models').User

exports.register = (server, options, next) => {
  // declare dependencies to hapi-auth-* plugins
  server.register([
    {
      register: require('hapi-auth-cookie')
    },
    {
      register: require('hapi-auth-basic')
    },
    {
      register: require('bell')
    }
  ], err => {
    Hoek.assert(!err, 'Cannot register authentication plugins')

    /**
     * Basic authentication strategy for username and password
     */
    server.auth.strategy('basic', 'basic', {
      validateFunc: (request, email, password, callback) => {
        User.findByEmail(email).then(user => {
          if (!user) {
            return Promise.reject(Boom.notFound('There is no user with the given email address'))
          }

          return user.comparePassword(password)
        }).then(user => {
          return callback(null, true, user)
        }).catch(err => {
          return callback(err, false)
        })
      }
    })

    /**
     * Register cookie-based session auth to remember
     * the logged in user
     */
    server.auth.strategy('session', 'cookie', 'try', {
      redirectTo: '/login',
      password: 'ThisIsASecretPasswordForTheAuthCookie',
      appendNext: true, // appends the current URL to the query param "next". Set to a string to use a different query param name
      isSecure: process.env.NODE_ENV === 'production',
      validateFunc: (request, session, callback) => {
        // validate the existing session
        // we only store the user’s id within the session
        const userId = session.id

        // user lookup and return credentials if available
        User.findById(userId, function (err, user) {
          if (!user || err) {
            return callback(err, false)
          }

          callback(null, true, user)
        })
      }
    })

    /**
     * trakt.tv OAuth config
     */
    const uri = 'https://api.trakt.tv'
    const user = uri + '/users/me'

    server.auth.strategy('trakt', 'bell', {
      provider: {
        protocol: 'oauth2',
        auth: uri + '/oauth/authorize',
        token: uri + '/oauth/token',
        headers: {
          'trakt-api-version': 2,
          'trakt-api-key': process.env.TRAKT_CLIENT_ID
        },
        profile: function (credentials, params, get, callback) {
          const query = { extended: 'full' }

          get(user, query, profile => {
            credentials.profile = profile
            return callback()
          })
        }
      },
      password: 'ThisIsASecretCookiePasswordForTrakt',
      clientId: process.env.TRAKT_CLIENT_ID,
      clientSecret: process.env.TRAKT_CLIENT_SECRET,
      isSecure: process.env.NODE_ENV === 'production'
    })

    next()
  })
}

exports.register.attributes = {
  name: 'authentication',
  version: '1.0.0'
}
