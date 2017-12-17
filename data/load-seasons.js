'use strict'

const Fs = require('fs')
const Path = require('path')
const Listr = require('listr')
const Axios = require('axios')
const Dotenv = require('dotenv')

// import environment variables from local secrets.env file
Dotenv.config({ path: Path.resolve(__dirname, '..', 'secrets.env') })

// read movies and TV show sample data as JSON
const Shows = JSON.parse(Fs.readFileSync(Path.resolve(__dirname, 'shows.json'), 'utf8'))

/**
 * Start tasks to prepare or destroy data in MongoDB
 *
 * @param  {Listr} tasks  Listr instance with tasks
 * @return {void}
 */
async function kickoff (tasks) {
  await tasks.run()
  process.exit()
}

/**
 * Entry point for the NPM "pumpitup" and "cleanup" scripts
 * Imports movie and TV show sample data to MongoDB
 */
if (process.argv) {
  const tasks = [
    {
      title: 'Fetching seasons for TV shows',
      task: async (ctx, task) => {
        const promises = Shows.map(async show => {
          const url = `https://api.trakt.tv/shows/${show.ids.trakt}/seasons?extended=full,episodes`

          const response = await Axios({
            method: 'GET',
            url,
            headers: {
              'Content-type': 'application/json',
              'trakt-api-key': process.env.TRAKT_CLIENT_ID,
              'trakt-api-version': 2
            }
          })

          const seasons = response.data

          return seasons.map(season => {
            season.ids.show = show.ids.trakt

            const episodes = season.episodes.map(episode => {
              episode.ids.season = season.ids.trakt
              return episode
            })

            season.episodes = episodes
            return season
          })
        })

        const results = await Promise.all(promises)

        const filePath = Path.resolve(__dirname, 'seasons.json')
        Fs.writeFileSync(filePath, JSON.stringify(results, null, 2))
      }
    }
  ]

  kickoff(new Listr(tasks))
}
