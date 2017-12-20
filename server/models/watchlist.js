'use strict'

const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const watchlistSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }],
  shows: [{ type: Schema.Types.ObjectId, ref: 'Show' }]
})

module.exports = Mongoose.model('Watchlist', watchlistSchema)
