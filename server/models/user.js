'use strict'

const Mongoose = require('mongoose')
const Schema = Mongoose.Schema
const Bcrypt = require('bcrypt')
const Boom = require('boom')
const When = require('when')
const Md5 = require('md5')
const Crypto = require('crypto')
const Validator = require('validator')

const SALT_WORK_FACTOR = 12

const userSchema = new Schema({
  username: {
    type: String,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
    validate: {
      isAsync: true,
      validator: Validator.isEmail,
      message: 'Invalid email address'
    }
  },
  name: String,
  password: String,
  url: String,
  resetPasswordToken: String,
  resetPasswordDeadline: Date,
  authToken: {
    type: String,
    default: Crypto.randomBytes(20).toString('hex')
  },
  authTokenIssued: Date,
  scope: [ String ]
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

  return Bcrypt.compare(candidatePassword, self.password).then(isMatch => {
    if (isMatch) {
      return When.resolve(self)
    }

    return When.reject(Boom.badRequest('The entered password is not correct'))
  }).catch(err => {
    err = Boom.create(400, err.message, {
      password: { message: err.message }
    })

    return When.reject(err)
  })
}

userSchema.methods.hashPassword = function () {
  const self = this

  return Bcrypt.genSalt(SALT_WORK_FACTOR).then(salt => {
    return Bcrypt.hash(self.password, salt)
  }).then(hash => {
    self.password = hash
    return When.resolve(self)
  }).catch(err => {
    return When.reject(Boom.badRequest('There was an error while hashing your password'))
  })
}

userSchema.methods.generateAuthToken = () => {
  this.authToken = Crypto.randomBytes(20).toString('hex')
  return When.resolve(this)
}

userSchema.methods.resetPassword = function () {
  this.resetPasswordToken = Crypto.randomBytes(20).toString('hex')
  this.resetPasswordDeadline = Date.now() + 1000 * 60 * 60 // 1 hour from now
  return this
}

/**
 * Virtuals
 */
userSchema.virtual('gravatar').get(function () {
  const hash = Md5(this.email)
  return `https://gravatar.com/avatar/${hash}?s=200`
})

module.exports = Mongoose.model('User', userSchema)
