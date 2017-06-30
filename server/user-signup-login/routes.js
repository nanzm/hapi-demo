'use strict'

const Handler = require('./handler')

const Routes = [
  {
    method: 'GET',
    path: '/',
    config: Handler.index
  },
  {
    method: 'GET',
    path: '/signup',
    config: Handler.showSignup
  },
  {
    method: 'POST',
    path: '/signup',
    config: Handler.signup
  },
  {
    method: 'GET',
    path: '/login',
    config: Handler.showLogin
  },
  {
    method: 'POST',
    path: '/login',
    config: Handler.login
  },
  {
    method: 'GET',
    path: '/forgot-password',
    config: Handler.showForgotPassword
  },
  {
    method: 'POST',
    path: '/forgot-password',
    config: Handler.forgotPassword
  },
  {
    method: 'GET',
    path: '/reset-password',
    config: Handler.showResetPassword
  },
  {
    method: 'POST',
    path: '/reset-password',
    config: Handler.resetPassword
  },
  {
    method: 'GET',
    path: '/logout',
    config: Handler.logout
  }
]

module.exports = Routes
