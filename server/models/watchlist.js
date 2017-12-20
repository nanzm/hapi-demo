'use strict'

const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const watchlistSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }],
  shows: [{ type: Schema.Types.ObjectId, ref: 'Show' }]
})

// this is a helper function to populate “seasons” on queries
function autopopulate (next) {
  this.populate('movies').populate('shows')
  next()
}

watchlistSchema.pre('find', autopopulate)
watchlistSchema.pre('findOne', autopopulate)

watchlistSchema.methods.includesMovie = function (candidateMovie) {
  const movies = this.movies.filter(movie => {
    return movie.id === candidateMovie.id
  })

  console.log(movies)
  return movies.length > 0
}

watchlistSchema.methods.includesShow = function (candidateShow) {
  const shows = this.shows.filter(show => {
    return show.id === candidateShow.id
  })

  return shows.length > 0
}

module.exports = Mongoose.model('Watchlist', watchlistSchema)
