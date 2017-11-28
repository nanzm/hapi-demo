'use strict'

const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const episodeSchema = new Schema({
  title: {
    type: String,
    trim: true
  },
  ids: {
    trakt: Number,
    imdb: String,
    tvdb: Number,
    tmdb: Number,
    tvrage: Number,
    season: Number
  },
  number: Number,
  number_abs: Number,
  season: Number,
  overview: String,
  rating: Number,
  votes: Number,
  first_aired: String,
  runtime: Number, // in minutes
  available_translations: [String]
})

module.exports = Mongoose.model('Episode', episodeSchema)
