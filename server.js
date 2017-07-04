'use strict'

const Hapi = require('hapi')
const Path = require('path')
const Dotenv = require('dotenv')

// import environment variables from local secrets.env file
Dotenv.config({ path: 'secrets.env' })

// create new server instance
const server = new Hapi.Server()

// add server’s connection information
server.connection({
  host: 'localhost',
  port: 3000
})

// register plugins to server instance
server.register([
  {
    register: require('inert')
  },
  {
    register: require('vision')
  },
  {
    register: require('hapi-dev-errors'),
    options: {
      showErrors: process.env.NODE_ENV !== 'production'
    }
  },
  {
    register: require('./server/base')
  },
  {
    register: require('./server/authentication')
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
  }
], err => {
  if (err) {
    throw err
  }

  const viewsPath = __dirname + '/public/views'

  server.views({
    engines: {
      hbs: require('handlebars')
    },
    path: viewsPath,
    layoutPath: Path.resolve(viewsPath, 'layouts'),
    layout: 'layout',
    partialsPath: Path.resolve(viewsPath, 'partials'),
    isCached: process.env.NODE_ENV === 'production',
    context: {
      title: 'Futureflix'
    }
  })

  // start your server
  server.start(err => {

    if (err) {
      throw err
    }

    console.log('Server running at: ' + server.info.uri)
  })
})
