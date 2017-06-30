'use strict'

const Mongoose = require('mongoose')
const User = require('./user')

// tell Mongoose to use ES6 promises
Mongoose.Promise = global.Promise

// Connect to our database and handle an bad connections
Mongoose.createConnection('mongodb://localhost/future-coffee')

Mongoose.connection.on('error', err => {
  console.error(`⚡️ 🚨 ⚡️ 🚨 ⚡️ 🚨 → ${err.message}`)
})

// use ES6 shorthands: "propertyName: variableName" equals "propertyName"
module.exports = {
  User: Mongoose.model('User')
}
