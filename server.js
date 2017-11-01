'use strict'

const Hapi = require('hapi')
const Path = require('path')
const Laabr = require('laabr')
const Dotenv = require('dotenv')

// import environment variables from local secrets.env file
Dotenv.config({ path: Path.resolve(__dirname, 'secrets.env') })

// configure logger
Laabr.format('log', ':time :level :message')

// create new server instance
const server = new Hapi.Server()

// add server’s connection information
server.connection({
  host: 'localhost',
  port: process.env.PORT || 3000
})

// register plugins to server instance
server.register(
  [
    {
      register: require('inert')
    },
    {
      register: require('vision')
    },
    {
      register: require('crumb'),
      options: {
        cookieOptions: {
          isSecure: process.env.NODE_ENV === 'production'
        }
      }
    },
    {
      register: require('hapi-dev-errors'),
      options: {
        showErrors: process.env.NODE_ENV !== 'production',
        useYouch: true
        //template: 'server-error'
      }
    },
    {
      register: Laabr.plugin,
      options: {
        colored: true,
        hapiPino: {
          logPayload: false
        }
      }
    },
    {
      register: require('./server/authentication')
    },
    {
      register: require('./server/base')
    },
    {
      register: require('./server/add-user-to-request')
    },
    {
      register: require('./server/add-user-to-views')
    },
    {
      register: require('./server/user-signup-login')
    },
    {
      register: require('./server/user-profile')
    },
    {
      register: require('./server/movies')
    },
    {
      register: require('./server/tv-shows')
    }
  ],
  err => {
    if (err) {
      throw err
    }

    const viewsPath = Path.resolve(__dirname, 'public', 'views')

    server.views({
      engines: {
        hbs: require('handlebars')
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
    server.start().catch(err => {
      throw err
    })
  }
)
