const express = require('express');
const UserRouter = require('./user/user.router');
const i18next = require('i18next');
const backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const errorHandler = require('./error/ErrorHandler');

i18next
  .use(backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      lookupHeader: 'accept-language',
    },
  });

const app = express();

app.use(middleware.handle(i18next));

app.use(express.json());

app.use(UserRouter);

app.use(errorHandler)

module.exports = app;
