'use strict'

const Hoek = require('hoek')
const Boom = require('boom')
const User = require('./../models').User

exports.register = (server, options, next) => {
  // declare dependencies to auth related hapi plugins (hapi-auth-*/bell/…)
  server.register([
    {
      register: require('hapi-auth-cookie')
    },
    {
      register: require('hapi-auth-basic')
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
            return Promise.reject(Boom.badRequest('There is no user with the given email address'))
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
        User.findById(userId).then(user => {
          if (!user) {
            return callback(null, false)
          }

          callback(err, true, user)
        }).catch(() => {
          return callback(null, false)
        })
      }
    })

    next()
  })
}

exports.register.attributes = {
  name: 'authentication',
  version: '1.0.0'
}
