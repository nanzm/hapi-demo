'use strict'

const Mongoose = require('mongoose')
const MongooseRandom = require('mongoose-simple-random')
const Schema = Mongoose.Schema

const showSchema = new Schema(
  {
    title: {
      type: String,
      unique: true,
      trim: true,
      required: true
    },
    ids: {
      trakt: Number,
      slug: String,
      imdb: String,
      tvdb: Number,
      tmdb: Number,
      fanart: Number,
      tvrage: Number
    },
    images: {
      poster: String,
      background: String
    },
    overview: String,
    trailer: String,
    homepage: String,
    status: String,
    year: Number,
    first_aired: Date,
    airs: {
      day: String,
      time: String,
      timezone: String
    },
    aired_episodes: Number,
    rating: Number,
    votes: Number,
    runtime: Number,
    genres: [String],
    language: String,
    certification: String,
    network: String,
    country: String
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

//
showSchema.virtual('seasons', {
  ref: 'Season',
  localField: 'ids.trakt',
  foreignField: 'ids.show',

  populate: {
    path: 'episodes'
  }
})

function autopopulate(next) {
  this.populate('seasons')
  next()
}

showSchema.pre('find', autopopulate)
showSchema.pre('findOne', autopopulate)

showSchema.methods.toJSON = function() {
  let obj = this.toObject()
  delete obj.__v
  return obj
}

// add plugin to find random movies
showSchema.plugin(MongooseRandom)

showSchema.statics.random = function(limit) {
  const self = this

  return new Promise((resolve, reject) => {
    self.findRandom({}, {}, { limit }, (err, results) => {
      if (err) {
        return reject(err)
      }

      return resolve(results)
    })
  })
}

module.exports = Mongoose.model('Show', showSchema)
