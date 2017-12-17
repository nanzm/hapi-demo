'use strict'

const Hapi = require('hapi')
const Path = require('path')
const Laabr = require('laabr')
const Dotenv = require('dotenv')
const Handlebars = require('handlebars')
const HandlebarsRepeatHelper = require('handlebars-helper-repeat')

// extend handlebars instance
Handlebars.registerHelper('repeat', HandlebarsRepeatHelper)

// import environment variables from local secrets.env file
Dotenv.config({ path: Path.resolve(__dirname, 'secrets.env') })

// configure logger
Laabr.format('log', ':time :level :message')

// create new server instance for the frontend
// add server’s connection information
const server = new Hapi.Server({
  host: 'localhost',
  port: process.env.PORT || 3000
})

// register plugins, configure views and start the server frontend instance
async function startFrontend() {
  // register plugins to server instance
  await server.register([
    {
      plugin: require('inert')
    },
    {
      plugin: require('vision')
    },
    {
      plugin: require('crumb'),
      options: {
        key: 'keepMeSafeFromCsrf',
        cookieOptions: {
          isSecure: process.env.NODE_ENV === 'production'
        }
      }
    },
    {
      plugin: require('hapi-dev-errors'),
      options: {
        showErrors: process.env.NODE_ENV !== 'production',
        useYouch: true
      }
    },
    {
      plugin: Laabr.plugin,
      options: {
        colored: true,
        hapiPino: {
          logPayload: false
        }
      }
    },
    {
      plugin: require('./server/authentication')
    },
    {
      plugin: require('./server/base')
    },
    {
      plugin: require('./server/add-user-to-request')
    },
    {
      plugin: require('./server/add-user-to-views')
    },
    {
      plugin: require('./server/user-signup-login')
    },
    {
      plugin: require('./server/user-profile')
    },
    {
      plugin: require('./server/movies')
    },
    {
      plugin: require('./server/tv-shows')
    }
  ])

  // view configuration
  const viewsPath = Path.resolve(__dirname, 'public', 'views')

  server.views({
    engines: {
      hbs: Handlebars
    },
    path: viewsPath,
    layoutPath: Path.resolve(viewsPath, 'layouts'),
    layout: 'layout',
    helpersPath: Path.resolve(viewsPath, 'helpers'),
    partialsPath: Path.resolve(viewsPath, 'partials'),
    isCached: process.env.NODE_ENV === 'production',
    context: {
      title: 'Futureflix'
    }
  })

  // start your server
  try {
    await server.start()
    console.log(`Server started → ${server.info.uri}`)
  } catch (err) {
    console.log(err)
    console.error(err)
    process.exit(1)
  }
}

const api = new Hapi.Server({
  host: 'localhost',
  port: process.env.PORT_API || 3001
})

// register plugins and start the API server instance
async function startApi () {
  // register plugins to server instance
  await api.register([
    {
      plugin: require('hapi-dev-errors'),
      options: {
        showErrors: process.env.NODE_ENV !== 'production',
        useYouch: true
      }
    },
    {
      plugin: Laabr.plugin,
      options: {
        colored: true,
        hapiPino: {
          logPayload: false
        }
      }
    },
    {
      plugin: require('./server/api-movies')
    },
    {
      plugin: require('./server/api-tv-shows')
    }
  ])

  // start your server
  try {
    await api.start()
    console.log(`API started → ${api.info.uri}`)
  } catch (err) {
    console.log(err)
    console.error(err)
    process.exit(1)
  }
}

startFrontend()
startApi()

process.on('unhandledRejection', error => {
  console.log(error)
  process.exit(1)
})
