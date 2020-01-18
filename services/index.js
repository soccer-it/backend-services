const express = require('express');
const helmet = require('helmet');
const app = express();

import health from './health';

app.use(express.urlencoded({ extended: false }));

app.use(function(_, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  next();
});

app.use(helmet());

app.get('*', health);

export default app;
