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

// create new web instance
// add web’s connection information
const web = new Hapi.Server({
  host: 'localhost',
  port: process.env.PORT_WEB || 3000
})

// register plugins, configure views and start the web instance
async function startWeb () {
  // register plugins to web instance
  await web.register([
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
      plugin: require('./web/authentication')
    },
    {
      plugin: require('./web/base')
    },
    {
      plugin: require('./web/add-user-to-request')
    },
    {
      plugin: require('./web/add-user-to-views')
    },
    {
      plugin: require('./web/user-signup-login')
    },
    {
      plugin: require('./web/user-profile')
    },
    {
      plugin: require('./web/user-watchlist')
    },
    {
      plugin: require('./web/movies')
    },
    {
      plugin: require('./web/tv-shows')
    }
  ])

  // view configuration
  const viewsPath = Path.resolve(__dirname, 'public', 'views')

  web.views({
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

  // start your web
  try {
    await web.start()
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

// register plugins and start the API web instance
async function startApi () {
  // register plugins to web instance
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
      plugin: require('./api/movies')
    },
    {
      plugin: require('./api/tv-shows')
    }
  ])

  // start your web
  try {
    await api.start()
  } catch (err) {
    console.log(err)
    console.error(err)
    process.exit(1)
  }
}

startWeb()
startApi()

process.on('unhandledRejection', error => {
  console.log(error)
  process.exit(1)
})
