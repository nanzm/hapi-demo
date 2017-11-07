'use strict'

const Mongoose = require('mongoose')
const Schema = Mongoose.Schema
const Bcrypt = require('bcrypt')
const Boom = require('boom')
const MD5 = require('md5')
const Crypto = require('crypto')
const Validator = require('validator')

const SALT_WORK_FACTOR = 12

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
    validate: {
      isAsync: true,
      validator: Validator.isEmail,
      message: 'Invalid email address'
    }
  },
  password: String,
  username: {
    type: String,
    unique: true,
    trim: true
  },
  homepage: {
    type: String,
    unique: true,
    trim: true
  },
  name: String,
  passwordResetToken: {
    type: String,
    trim: true,
    unique: true, // creates an index in MongoDB, making sure for unique values
    sparse: true // this makes sure the unique index applies to not null values only (= unique if not null)
  },
  passwordResetDeadline: Date,
  authToken: {
    type: String,
    default: Crypto.randomBytes(20).toString('hex')
  },
  authTokenIssued: {
    type: Date,
    default: Date.now()
  },
  scope: [String]
  // hearts: [
  //   { type: Mongoose.Schema.ObjectId, ref: 'Store' }
  // ]
})

/**
 * Statics
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email })
}

/**
 * Instance Methods
 */
userSchema.methods.comparePassword = function (candidatePassword) {
  const self = this

  return Bcrypt.compare(candidatePassword, self.password)
    .then(isMatch => {
      if (isMatch) {
        return Promise.resolve(self)
      }

      return Promise.reject(Boom.badRequest('The entered password is incorrect'))
    })
    .catch(err => {
      err = Boom.create(400, err.message, {
        password: { message: err.message }
      })

      return Promise.reject(err)
    })
}

userSchema.methods.hashPassword = function () {
  const self = this

  return Bcrypt.genSalt(SALT_WORK_FACTOR)
    .then(salt => {
      return Bcrypt.hash(self.password, salt)
    })
    .then(hash => {
      self.password = hash
      return Promise.resolve(self)
    })
    .catch(() => {
      return Promise.reject(Boom.badRequest('There was an error while hashing your password'))
    })
}

userSchema.methods.generateAuthToken = function () {
  this.authToken = Crypto.randomBytes(20).toString('hex')
  return Promise.resolve(this)
}

userSchema.methods.resetPassword = function () {
  let self = this
  const passwordResetToken = Crypto.randomBytes(20).toString('hex')

  return Bcrypt.genSalt(SALT_WORK_FACTOR)
    .then(salt => {
      return Bcrypt.hash(passwordResetToken, salt)
    })
    .then(hash => {
      self.passwordResetToken = hash
      self.passwordResetDeadline = Date.now() + 1000 * 60 * 60 // 1 hour from now

      return self.save().then(user => {
        return Promise.resolve({ passwordResetToken, user })
      })
    })
    .catch(() => {
      return Promise.reject(Boom.badRequest('An error occurred while hashing your password reset token'))
    })
}

userSchema.methods.comparePasswordResetToken = function (resetToken) {
  const self = this

  return Bcrypt.compare(resetToken, self.passwordResetToken)
    .then(isMatch => {
      if (isMatch) {
        return Promise.resolve(self)
      }

      return Promise.reject(Boom.badRequest('Your password reset token is invalid, please request a new one.'))
    })
    .catch(err => {
      err = Boom.create(400, err.message, {
        password: { message: err.message }
      })

      return Promise.reject(err)
    })
}

/**
 * Virtuals
 */
userSchema.virtual('gravatar').get(function () {
  // create the MD5 hash from the user’s email address
  const hash = MD5(this.email)
  // return the ready-to-load avatar URL
  return `https://gravatar.com/avatar/${hash}?s=200`
})

module.exports = Mongoose.model('User', userSchema)
