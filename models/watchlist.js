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

watchlistSchema.methods.addMovie = function (movie) {
  if (!movie) {
    return
  }

  if (!this.includesMovie(movie)) {
    this.movies.push(movie)
  }
}

watchlistSchema.methods.includesMovie = function (candidateMovie) {
  if (!candidateMovie) {
    return true
  }

  const movies = this.movies.filter(movie => {
    return movie.id === candidateMovie.id
  })

  return movies.length > 0
}

watchlistSchema.methods.addShow = function (show) {
  if (!show) {
    return
  }

  if (!this.includesShow(show)) {
    this.shows.push(show)
  }
}

watchlistSchema.methods.includesShow = function (candidateShow) {
  if (!candidateShow) {
    return true
  }

  const shows = this.shows.filter(show => {
    return show.id === candidateShow.id
  })

  return shows.length > 0
}

module.exports = Mongoose.model('Watchlist', watchlistSchema)
