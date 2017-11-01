'use strict'

const Joi = require('joi')
const Path = require('path')
const User = require(Path.resolve(__dirname, '..', 'models')).User

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
      const payload = request.payload

      // check if the username is already chosen
      User.findOne({ username: payload.username, email: { $ne: request.user.email } }).then(user => {
        if (user) {
          // create an error object that matches our error structure
          const error = Boom.create(409, 'Username is already taken', {
            email: { message: 'Username is already taken' }
          })

          return Promise.reject(error)
        }
      })

      // process the actual user update
      User.findOneAndUpdate(
        { _id: request.user._id }, // filters the document
        {
          $set: {
            username: payload.username,
            homepage: payload.homepage
          }
        },
        {
          new: true // tells Mongoose to return the post-update document
        }
      ).then(user => {
        request.user = user
        reply.view('user/profile')
      })
    },
    validate: {
      payload: {
        username: Joi.string()
          .optional()
          .allow('')
          .allow(null),
        homepage: Joi.string()
          .optional()
          .allow('')
          .allow(null)
          .uri()
      }
    }
  }
}

module.exports = Handler
