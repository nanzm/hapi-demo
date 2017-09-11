'use strict'

const Joi = require('joi')
const Boom = require('boom')
const User = require('./../models').User
const Mailer = require('../utils/mailer')
const ErrorExtractor = require('../utils/error-extractor')

const Handler = {
  showSignup: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      reply.view('signup')
    }
  },

  signup: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      // shortcut
      const payload = request.payload

      // check whether the email address is already registered
      User.findByEmail(payload.email).then(user => {
        if (user) {
          // create an error object that matches our error structure
          const error = Boom.create(409, 'Email address is already registered', {
            email: { message: 'Email address is already registered' }
          })

          return Promise.reject(error)
        }

        // create a new user
        const newUser = new User({
          email: payload.email,
          password: payload.password,
          scope: [ 'user' ]
        })

        // don’t store the plain password in your DB, hash it!
        return newUser.hashPassword()
      }).then(user => {
        return user.save()
      }).then(user => {
        request.cookieAuth.set({ id: user.id })

        const discoverURL = `http://${request.headers.host}/discover`
        Mailer.send('welcome', user, '📺 Futureflix — Great to see you!', { discoverURL })

        // \o/ wohoo, sign up successful
        return reply.view('signup-success')
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
        email: Joi.string().email({ minDomainAtoms: 2 }).required().label('Email address'),
        password: Joi.string().min(6).required().label('Password')
      },
      failAction: (request, reply, source, error) => {
        // prepare formatted error object
        const errors = ErrorExtractor(error)
        // remember the user’s email address and pre-fill for comfort reasons
        const email = request.payload.email

        return reply.view('signup', {
          email,
          errors
        }).code(400)
      }
    }
  },

  showLogin: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      return reply.view('login')
    }
  },

  login: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      // shortcut
      const payload = request.payload

      User.findByEmail(payload.email).then(user => {
        if (!user) {
          const error = Boom.create(404, '', {
            email: { message: 'Email address is not registered' }
          })

          return Promise.reject(error)
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
        email: Joi.string().email({ minDomainAtoms: 2 }).required().label('Email address'),
        password: Joi.string().min(6).required().label('Password')
      },
      failAction: (request, reply, source, error) => {
        // prepare formatted error object
        const errors = ErrorExtractor(error)
        // remember the user’s email address and pre-fill for comfort reasons
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
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      return reply.view('forgot-password')
    }
  },

  forgotPassword: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      // shortcut
      const payload = request.payload

      return User.findByEmail(payload.email).then(user => {
        if (!user) {
          const error = Boom.create(404, 'Email address is not registered', {
            email: { message: 'Email address is not registered' }
          })

          return Promise.reject(error)
        }

        user.resetPassword()

        return user.save()
      }).then(user => {
        const resetURL = `http://${request.headers.host}/reset-password/${user.resetPasswordToken}`
        return Mailer.send('password-reset', user, '📺 Futureflix - Password Reset', { resetURL })
      }).then(() => {
        return reply.view('forgot-password-email-sent')
      }).catch(err => {
        const status = err.isBoom ? err.output.statusCode : 400

        return reply.view('forgot-password', {
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
        email: Joi.string().email({ minDomainAtoms: 2 }).required().label('Email address'),
      },
      failAction: (request, reply, source, error) => {
        const errors = ErrorExtractor(error)
        const email = request.payload.email

        return reply.view('forgot-password', {
          email,
          errors
        }).code(400)
      }
    }
  },

  showResetPassword: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      return reply.view('reset-password', {
        resetToken: request.params.resetToken
      })
    },
    validate: {
      params: {
        resetToken: Joi.string().required().label('Password reset token')
      },
      failAction: (request, reply, source, error) => {
        const errors = ErrorExtractor(error)
        const resetToken = request.params.resetToken

        return reply.view('reset-password', {
          resetToken,
          errors
        }).code(400)
      }
    }
  },

  resetPassword: {
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/profile')
      }

      return User.findByPasswordResetToken(request.params.resetToken).then(user => {
        if (!user) {
          const error = Boom.create(400, '', {
            resetToken: { message: 'Your password reset token is invalid, please request a new one.' }
          })

          return Promise.reject(error)
        }

        user.password = request.payload.password
        return user.hashPassword()
      }).then(user => {
        return user.save()
      }).then(user => {
        request.cookieAuth.set({ id: user.id })

        return reply.view('reset-password-success')
      }).catch(err => {
        console.log(err)
        const status = err.isBoom ? err.output.statusCode : 400

        return reply.view('reset-password', {
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
        password: Joi.string().min(6).required().label('Password'),
        passwordConfirm: Joi.string().min(6).valid(Joi.ref('password')).required().options({
          language: {
            any: { allowOnly: 'must match password' }
          }
        }).label('Confirm password')
      },
      failAction: (request, reply, source, error) => {
        const errors = ErrorExtractor(error)

        return reply.view('reset-password', {
          resetToken: request.params.resetToken,
          errors
        }).code(400)
      }
    }
  },

  logout: {
    auth: 'session',
    handler: (request, reply) => {
      request.cookieAuth.clear()
      reply.redirect('/')
    }
  }
}

module.exports = Handler
