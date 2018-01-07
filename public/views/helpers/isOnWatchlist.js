'use strict'

module.exports = function (options) {
  // grab user from Handlebars context
  const user = options.data.root.user

  // “this” is the context data from Handlebars
  // either a movie or a show
  const movieOrShow = this

  if (!user) {
    return options.inverse(movieOrShow)
  }

  if (!user.watchlist.isOnWatchlist(movieOrShow)) {
    return options.inverse(movieOrShow)
  }

  return options.fn()
}
