'use strict'

const Joi = require('joi')
const Boom = require('boom')
const Path = require('path')
const User = require(Path.resolve(__dirname, '..', 'models')).User
const ErrorExtractor = require(Path.resolve(__dirname, '..', 'utils', 'error-extractor'))

const Handler = {
  profile: {
    auth: 'session',
    handler: (request, reply) => {
      reply.view('user/profile')
    }
  },

  update: {
    auth: 'session',
    handler: (request, reply) => {
      // shortcut
      const payload = request.payload

      // check if the username is already chosen
      return User.findOne({ username: payload.username, email: { $ne: request.user.email } })
        .then(user => {
          if (user) {
            // create an error object that matches our error structure
            const error = Boom.create(409, 'Username is already taken', {
              username: { message: 'Username is already taken' }
            })

            return Promise.reject(error)
          }

          return Promise.resolve()
        })
        .then(() => {
          // process the actual user update
          return User.findOneAndUpdate(
            { _id: request.user._id }, // filters the document
            {
              $set: {
                username: payload.username,
                homepage: payload.homepage
              }
            },
            {
              // returns the post-update document
              new: true

              // applies validators defined in the User model.
              // -> this option is off by default due to several caveats
              // -> check this section for more information: http://mongoosejs.com/docs/validation.html#update-validators
              // runValidators: true
            }
          )
        })
        .then(user => {
          request.user = user
          reply.view('user/profile')
        })
        .catch(err => {
          const status = err.isBoom ? err.output.statusCode : 400
          const user = Object.assign(request.user, { username: payload.username })

          return reply
            .view('user/profile', {
              user,
              errors: err.data
            })
            .code(status)
        })
    },
    validate: {
      payload: {
        username: Joi.string()
          .label('Username')
          .optional()
          .allow('')
          .allow(null),
        homepage: Joi.string()
          .label('Homepage')
          .optional()
          .allow('')
          .allow(null)
          .uri()
      },
      failAction: (request, reply, source, error) => {
        // prepare formatted error object
        const errors = ErrorExtractor(error)

        // grab incoming payload values
        const { username, homepage } = request.payload

        // merge existing user data with incoming values
        const user = Object.assign(request.user, { username, homepage })

        return reply
          .view('user/profile', {
            user,
            errors
          })
          .code(400)
      }
    }
  }
}

module.exports = Handler
