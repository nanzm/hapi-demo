'use strict'

const Fs = require('fs')
const Path = require('path')
const Boom = require('boom')
const Nodemailer = require('nodemailer')
const Handlebars = require('handlebars')
const htmlToText = require('html-to-text')
const Promisify = require('es6-promisify')
const PostmarkTransport = require('nodemailer-postmark-transport')
const Transporter = Nodemailer.createTransport(PostmarkTransport({
  auth: {
    apiKey: process.env.POSTMARK_API_KEY
  }
}))
const Templates = Path.resolve(__dirname, '..', 'email-templates')

/**
 * filename: email template name, without ".html" file ending. Email templates are located within "server/email-templates"
 * options: data which will be used to replace the placeholders within the template
 **/
const prepareTemplate = (filename, options = {}) => {
  return Promise.promise((resolve, reject) => {
    const filePath = Path.resolve(Templates, `${filename}.html`)

    Fs.readFile(filePath, 'utf8', (err, fileContent) => {
      if (err) {
        return reject(Boom.badImplementation('Cannot read the email template content.'))
      }

      // use handlebars to render the email template
      // handlebars allows more complex templates with conditionals and nested objects, etc.
      // this way we have much more options to customize the templates based on given data
      const template = Handlebars.compile(fileContent)
      const compiledHtml = template(options)

      // generate a plain-text version of the same email
      const textContent = htmlToText.fromString(compiledHtml)

      return resolve({
        html: compiledHtml,
        text: textContent
      })
    })
  })
}

exports.send = (template, user, subject, data) => {
  return prepareTemplate(template, data).then(({ html, text }) => {
    return Promise.resolve({
      from: `Marcus Poehls <marcus@futurestud.io>`,
      to: user.email,
      subject: subject,
      html,
      text
    })
  }).then(mailOptions => {
    const send = Promisify(Transporter.sendMail, Transporter)
    return send(mailOptions)
  })
}
