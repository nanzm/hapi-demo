'use strict'

const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const seasonSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true
    },
    ids: {
      trakt: Number,
      slug: String,
      imdb: String,
      tmdb: Number,
      tvrage: Number,
      show: { type: Schema.Types.ObjectId, ref: 'Show' }
    },
    number: Number,
    overview: String,
    first_aired: String,
    runtime: Number, // in minutes
    network: String,
    rating: Number,
    votes: Number,
    episode_count: Number,
    aired_episodes: Number
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// virtual property for “episodes” instead of a
// dedicated “episodes” array within the schema
// this let’s you use Mongoose’s “toJSON” configuration
// to remove virtuals when sending to the client
seasonSchema.virtual('episodes', {
  ref: 'Episode',
  localField: '_id',
  foreignField: 'ids.season'
})

// this is a helper function to populate “episodes” on queries
function autopopulate (next) {
  this.populate('episodes')
  next()
}

seasonSchema.pre('find', autopopulate)
seasonSchema.pre('findOne', autopopulate)

module.exports = Mongoose.model('Season', seasonSchema)
