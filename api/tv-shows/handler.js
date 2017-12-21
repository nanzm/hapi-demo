'use strict'

const Boom = require('boom')
const Joi = require('joi')
const Path = require('path')
const Show = require(Path.resolve(__dirname, '..', '..', 'models')).Show

const Handler = {
  index: {
    handler: async (request, h) => {
      const shows = await Show.find()

      return shows
    }
  },
  show: {
    handler: async (request, h) => {
      const slug = request.params.slug
      const show = await Show.findOne({ 'ids.slug': slug })

      if (!show) {
        return Boom.notFound('Cannot find a show with that slug')
      }

      return show
    },
    validate: {
      params: {
        slug: Joi.string().required()
      }
    }
  }
}

module.exports = Handler
