'use strict'

const Fs = require('fs')
const Path = require('path')
const Boom = require('boom')
const When = require('when')
const Nodemailer = require('nodemailer')
const htmlToText = require('html-to-text')
const templates = Path.resolve(__dirname, '..', 'email-templates')
const Handlebars = require('handlebars')
const Promisify = require('es6-promisify')

const Transporter = Nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

/**
 * filename: email template name, without ".html" file ending. Email templates are located within "server/email-templates"
 * options: data which will be used to replace the placeholders within the template
 **/
const prepareTemplate = (filename, options = {}) => {
  // generate site url from content
  options.siteUrl = config.baseUrl.replace(/\/$/, '')

  return When.promise(function (resolve, reject) {
    const filePath = Path.resolve(templates, filename)

    Fs.readFile(filePath, 'utf8', (err, fileContent) => {
      if (err) {
        return reject(Boom.badImplementation('Cannot read the email template content.'))
      }

      // use handlebars to render the email template
      // handlebars allows more complex templates with conditionals and nested objects, etc.
      // this way we have much more options to customize the templates based on given data
      // e.g. if the user does not want to install MySQL, he wonâ€™t get the credentials
      // for MySQL in his "server launched" email
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
    return When.resolve({
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
