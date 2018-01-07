'use strict'

module.exports = options => {
  const user = options.data.root.user
  const movieOrShow = options.data.root.movie || options.data.root.show

  if (user.watchlist.isOnWatchlist(movieOrShow)) {
    return options.fn(this)
  }

  return options.inverse(movieOrShow)
}
