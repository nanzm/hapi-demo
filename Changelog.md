# Changelog

## 2.4.2 — 2017-xx-xx
- `add` teaser for [learn hapi learning path](http://learnhapi.com) on 404 page


## 2.4.1 — 2017-02-22
- `add` API URL in Swagger options to try requests against endpoints in the Swagger UI


## 2.4.0 — 2017-02-22
- `add` dependencies for JWT auth
- `add` JWT auth strategy
- `add` basic API plugin for users including endpoints for basic auth login and `/me`
- `add` Logger utility
- `update` `secrets.env.sample` with key for `JWT_SECRET_KEY`
- `update` project structure: move plugins used in web and api to `common` folder
- `update` Mailer utility: catch errors when sending an email and log the error message
- `update` API error interceptor and split handling for API and validation errors


## 2.3.0 — 2017-02-14
- `add` custom API error classes: `APIError` and `APIValidationError`
- `add` API error interceptor to respond a detailed error message
- `update` API TV show handler: use hapi's validation to restrict allowed path parameters


## 2.2.0 — 2017-02-07
- `add` API docs
- `add` API endpoint validation
- `add` API endpoint descriptions and tags to group API related endpoints


## 2.1.0 — 2017-01-16
- `add` API endpoints for movies and TV shows
- `add` views for watchlist and search results
- `add` Handlebars helper `isOnWatchlist`
- `update` Bulma from `0.5` to `0.6`
- `update` to Bulma's new navbar and add search input
- `update` Handlebars partials for hero and navbar
- `update` design for movie and TV show detail pages


## 2.0.0 — 2017-12-15
- `add` thank you section in readme
- `update` readme: add Node.js v8.x requirement, link to download for previous version
- `update` sample data and relationships
- `update` getting started tests
- `update` paginator utility to expose more fields
- `update` Vagrantfile with minor reformats


## 2.0.0-rc.1 — 2017-12-07
- --`upgrade` code base to hapi v17--
- `add` season and episode Mongoose models
- `add` sample data for seasons and episodes
- `update` data loader to import seasons and episodes
- `add` basic footer
- `add` paginator utility
- `add` TV shows overview with pagination
- `update` Eslint config to use `standard`
- `add` handlebars helpers for `isEqual`, `repeat`
- `add` sample tests to get started with testing


## 1.3.1 — 2017-11-23
- `add` step to create `secrets.env` from sample file in readme
- `update` font from Rubik to Inter UI
- `update` Eslint config
- `remove` duplicated layouts


## 1.3.0 — 2017-11-07
- `add` movie and TV show sample data
- `add` NPM command to import the sample data into MongoDB: `npm run pumpitup`
- `update` readme with instructions to load the sample data


## 1.2.0 — 2017-11-03
- `add` TRAKT_CLIENT_ID and TRAKT_CLIENT_SECRET environment variables to `secrets.env.sample`
- `add` required Node.js v6 engine to `package.json`
- `add` illustrative tests
- `update` profile view and move to dedicated folder
- `update` dependencies


## 1.1.0 — 2017-09-14
- `add` PORT environment variable to `secrets.env.sample`
- `update` mailer to use native Node.js promises
- `update` mailer to catch and proceed request on errors
- `fix` template preparation promise call in mailer
- `rename` file for environment variables from `secrets.env.example` to `secrets.env.sample`


## 1.0.0 — 2017-09-04
- `1.0.0` 📺 🤘
