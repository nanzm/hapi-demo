'use strict'

const Hoek = require('hoek')

/**
 * Check whether the response is an
 * instance of `APIError`.
 *
 * The `APIError` is a custom error class
 * located within the `api` directory.
 *
 * @param {Object} error instance
 *
 * @returns {boolean}
 */
function isApiError (error) {
  return error.isBoom && error.name === 'APIError'
}

/**
 * Check whether the response is
 * a `ValidationError`.
 *
 * The `ValidationError` is an error
 * from hapi itself. hapi throws these errors,
 * because we told it so within the
 * API server options (`server.js`)
 *
 * @param {Object} error instance
 *
 * @returns {boolean}
 */
function isHapiValidationError (error) {
  return error.isBoom && error.name === 'ValidationError'
}

function composeUrl (request, path) {
  // fetch HTTP protocol from reverse proxy
  const proxyProtocol = request.headers && request.headers['x-forwarded-proto']
  // protocol hierarchy: proxy, server, default 'http'
  const protocol = proxyProtocol || request.server.info.protocol || 'http'

  return `${protocol}://${request.info.host}${path}`
}

function register (server, options) {
  server.ext('onPreResponse', (request, h) => {
    const response = request.response

    // check for a custom "APIError" error
    // find custom errors in the `api/errors` directory
    if (isApiError(response)) {
      // API errors have their details in a "data" property
      const data = response.data

      // create error response payload
      // resolve full API documentation URL
      const payload = Object.assign(data, {
        message: Hoek.escapeHtml(data.message),
        documentationUrl: composeUrl(request, data.documentationUrl)
      })

      return h.response(payload).code(data.statusCode)
    }

    // the API server instance globally throws all validation errors
    // find the global throw-up config in the `server.js` ;-)
    if (isHapiValidationError(response)) {
      // validation errors in hapi contain an array called "details"
      // this "details" array contains all validation errors
      // pick the first error
      const data = response.details[0]

      // compose the custom error message in "oppa-hapi-style"
      const payload = {
        statusCode: 400,
        error: 'Bad Request',
        message: Hoek.escapeHtml(data.message) // HTML escape message to avoid echo attacks
      }

      return h.response(payload).code(payload.statusCode)
    }

    // neither APIError nor ValidationError
    // continue request lifecycle
    return h.continue
  })

  server.log('info', 'Plugin registered: API error interceptor (for API and Validation errors)')
}

exports.plugin = {
  name: 'api-error-interceptor',
  version: '1.0.0',
  register
}
