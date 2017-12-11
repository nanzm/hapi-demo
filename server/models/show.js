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

// use a virtual property for the “seasons” relation
// benefit from Mongoose’s “toJSON” configuration
// to remove seasons before sending them to the client
// this won’t bloat the JSON with ALL the data
// because this “seasons” population fetches
// the related episodes as well (defined in the ”season” model)
showSchema.virtual('seasons', {
  ref: 'Season',
  localField: '_id',
  foreignField: 'ids.show',

  populate: {
    path: 'episodes'
  }
})

// this is a helper function to populate “seasons” on queries
function autopopulate(next) {
  this.populate('seasons')
  next()
}

showSchema.pre('find', autopopulate)
showSchema.pre('findOne', autopopulate)

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
