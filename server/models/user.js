'use strict'

const Mongoose = require('mongoose')
const Schema = Mongoose.Schema
const Bcrypt = require('bcrypt')
const Boom = require('boom')
const MD5 = require('md5')
const Crypto = require('crypto')
const Validator = require('validator')
const Slug = require('slugify')
const _ = require('lodash')

const SALT_WORK_FACTOR = 12

const userSchema = new Schema(
  {
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

/**
* pre-save Model hook to generate a unique username
*/
userSchema.pre('save', function (next) {
  if (this.isModified('username')) {
    // stop here, because username wasn’t modified
    return next()
  }

  // split email address at @ symbol and only return the first part
  const email = _.first(_.split(this.email, '@', 1))

  // generate slug from username
  this.username = Slug(email)

  console.log(this.username)
  console.log(email)

  // find other stores that have a slug of wes, wes-1, wes-2
  const usernameRegEx = new RegExp(`^(${this.username})((-[0-9]*$)?)$`, 'i')

  this.constructor.find({ username: usernameRegEx }).then(existingUsers => {
    // TODO this can lead to duplicated keys
    // say there are usernames for 'marcus', 'marcus-1' and 'marcus-2'
    // if 'marcus-1' deletes the account, the search for existing users results in length of 2
    // trying to set the username to 'marcus-2' will cause a duplicate
    if (existingUsers.length) {
      console.log('puh, username exists')
      this.username = `${this.username}-${existingUsers.length + 1}`
      console.log('new one:')
      console.log(this.username)
    }

    next()
  })
})

/**
 * Statics
 *
 * use the “User” model in your app and static methods to find documents
 * like: User.findByEmail('marcus@futurestud.io').then(user => {})
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
