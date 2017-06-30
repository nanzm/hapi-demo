'use strict'

const Joi = require('joi')
const Bcrypt = require('bcrypt')
const When = require('when')
const Boom = require('boom')
const User = require('./../models').User
const ErrorExtractor = require('../../utils/error-extractor')

const Handler = {
  index: {
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      reply.view('index')
    }
  },

  showSignup: {
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      reply.view('signup')
    }
  },

  signup: {
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      // shortcut
      const payload = request.payload

      User.findByEmail(payload.email).then(user => {
        if (user) {
          const error = Boom.create(409, 'Email address is already registered', {
            email: { message: 'Email address is already registered' }
          })

          return When.reject(error)
        }

        const newUser = new User({
          email: payload.email,
          password: payload.password,
          scope: [ 'user' ]
        })

        return newUser.hashPassword()
      }).then(user => {
        return user.save()
      }).then(user => {
        request.cookieAuth.set({ id: user.id })

        return reply.redirect('/profile')
      }).catch(err => {
        const status = err.isBoom ? err.output.statusCode : 400

        return reply.view('signup', {
          email: payload.email,
          errors: err.data
        }).code(status)
      })
    },
    validate: {
      options: {
        stripUnknown: true,
        abortEarly: false
      },
      payload: {
        email: Joi.string().required().label('Email address'),
        password: Joi.string().min(6).required().label('Password')
      },
      failAction: (request, reply, source, error) => {
        const errors = ErrorExtractor(error)
        const email = request.payload.email

        return reply.view('signup', {
          email,
          errors
        }).code(400)
      }
    }
  },

  showLogin: {
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      return reply.view('login')
    }
  },

  login: {
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      // shortcut
      const payload = request.payload

      User.findByEmail(payload.email).then(user => {
        if (!user) {
          const error = Boom.create(400, 'Email address is not registered', {
            email: { message: 'Email address is not registered' }
          })

          return When.reject(error)
        }

        return user.comparePassword(payload.password)
      }).then(user => {
        request.cookieAuth.set({ id: user.id })

        return reply.redirect('/profile')
      }).catch(err => {
        const status = err.isBoom ? err.output.statusCode : 400

        return reply.view('login', {
          email: payload.email,
          errors: err.data
        }).code(status)
      })
    },
    validate: {
      options: {
        stripUnknown: true,
        abortEarly: false
      },
      payload: {
        email: Joi.string().required().label('Email address'),
        password: Joi.string().min(6).required().label('Password')
      },
      failAction: (request, reply, source, error) => {
        const errors = ErrorExtractor(error)
        const email = request.payload.email

        return reply.view('login', {
          email,
          errors
        }).code(400)
      }
    }
  },

  showForgotPassword: {
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      return reply.view('forgot-password')
    }
  },

  forgotPassword: {
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      // shortcut
      const payload = request.payload

      // TODO
      // generate pw reset token, set pw reset deadline
      // send pw reset mail to user

      return reply()
    },
    validate: {
      options: {
        stripUnknown: true,
        abortEarly: false
      },
      payload: {
        email: Joi.string().required().label('Email address'),
        password: Joi.string().min(6).required().label('Password')
      },
      failAction: (request, reply, source, error) => {
        const errors = ErrorExtractor(error)
        const email = request.payload.email

        return reply.view('login', {
          email,
          errors
        }).code(400)
      }
    }
  },

  showResetPassword: {
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      return reply.view('reset-password', {
        resetToken: request.query.resetToken
      })
    },
    validate: {
      query: {
        resetToken: Joi.string().required().label('Password reset token')
      }
    }
  },

  resetPassword: {
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: function (request, reply) {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      return reply()
    },
    validate: {
      options: {
        stripUnknown: true,
        abortEarly: false
      },
      payload: {
        email: Joi.string().required().label('Email address'),
        password: Joi.string().min(6).required().label('Password')
      },
      failAction: (request, reply, source, error) => {
        const errors = ErrorExtractor(error)
        const email = request.payload.email

        return reply.view('login', {
          email,
          errors
        }).code(400)
      }
    }
  },

  logout: {
    auth: 'session',
    handler: function (request, reply) {
      request.cookieAuth.clear()
      reply.redirect('/')
    }
  }
}

module.exports = Handler
