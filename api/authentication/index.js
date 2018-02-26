'use strict'

const Boom = require('boom')
const User = require('../../models').User

async function register (server, options) {
  // declare dependencies to hapi auth plugins
  await server.register([
    {
      plugin: require('hapi-auth-basic')
    },
    {
      plugin: require('@now-ims/hapi-now-auth') // JWT
    }
  ])

  /**
   * Basic authentication strategy for username and password
   */
  server.auth.strategy('basic', 'basic', {
    validate: async (request, email, password) => {
      const user = await User.findByEmail(email)

      if (!user) {
        throw Boom.notFound('There is no user with the given email address')
      }

      await user.comparePassword(password)

      return { credentials: user, isValid: true }
    }
  })

  /**
   * JWT strategy (for API requests)
   */
  if (!process.env.JWT_SECRET_KEY) {
    throw new Boom('Missing JWT_SECRET_KEY environment variable. Add it to your ENV vars')
  }

  server.auth.strategy('jwt', 'hapi-now-auth', {
    keychain: [process.env.JWT_SECRET_KEY],
    tokenType: 'Bearer',
    verifyJWT: true,
    verifyOptions: {
      algorithms: ['HS256']
    },
    validate: (request, { decodedJWT, token }, h) => {
      // decodedJWT = JWT payload
      // the payload contains the user object
      // no further database lookup required
      const user = decodedJWT.user

      if (user) {
        return { credentials: user, isValid: true }
      }

      return { isValid: false }
    },
    unauthorized: message => {
      throw Boom.unauthorized(message || 'Invalid or expired JWT')
    }
  })

  server.auth.default('jwt')
}

exports.plugin = {
  name: 'authentication',
  version: '1.0.0',
  register
}
