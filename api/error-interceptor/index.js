'use strict'

function isApiError (error) {
  return error.isBoom && error.name === 'APIError'
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

    if (isApiError(response)) {
      // API errors have their details in a "data" property
      const data = response.data

      // create error response payload
      // resolve full API documentation URL
      const payload = Object.assign(data, {
        documentationUrl: composeUrl(request, data.documentationUrl)
      })

      return h.response(payload).code(data.statusCode)
    }

    // continue request lifecycle
    return h.continue
  })

  server.log('info', 'Plugin registered: API error interceptor (add documentation link)')
}

exports.plugin = {
  name: 'api-error-interceptor',
  version: '1.0.0',
  register
}
