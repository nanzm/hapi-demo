'use strict'

const Hapi = require('hapi')
const HapiSwagger = require('hapi-swagger')
const Pkg = require('./package')
const Path = require('path')
const Laabr = require('laabr')
const Dotenv = require('dotenv')
const Inert = require('inert')
const Vision = require('vision')
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
    Inert,
    Vision,
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
      plugin: require('./common/add-user-to-request')
    },
    {
      plugin: require('./web/base')
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
    },
    {
      plugin: require('./web/search')
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

  // start the web
  try {
    await web.start()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

const api = new Hapi.Server({
  host: 'localhost',
  port: process.env.PORT_API || 3001,
  routes: {
    validate: {
      failAction (request, h, error) {
        // hapi v17 generates a default error response hiding all validation error details
        // this will always throw the validation error
        // the thrown validation error will be transformed within the `error-interceptor` plugin
        throw error
      }
    }
  }
})

// register plugins and start the API web instance
async function startAPI () {
  const swaggerOptions = {
    schemes: ['https'],
    host: 'api.futureflix.space',
    info: {
      title: 'Futureflix API Documentation',
      version: Pkg.version,
      description:
        'Futureflix comes with a full-fledged API. You can find the documentation on all provided endpoints here.'
    },
    documentationPath: '/docs',
    grouping: 'tags',
    tags: [
      {
        name: 'Movies',
        description: 'Access movie data'
      },
      {
        name: 'TV shows',
        description: 'Access TV show data'
      }
    ]
  }

  // register plugins to API instance
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
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    },
    {
      plugin: require('./api/authentication')
    },
    {
      plugin: require('./common/add-user-to-request')
    },
    {
      plugin: require('./api/error-interceptors')
    },
    {
      plugin: require('./api/movies')
    },
    {
      plugin: require('./api/tv-shows')
    },
    {
      plugin: require('./api/users')
    }
  ])

  // start the API
  try {
    await api.start()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

startWeb()
startAPI()

process.on('unhandledRejection', error => {
  console.log(error)
  process.exit(1)
})
