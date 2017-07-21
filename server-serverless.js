'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const express = require('express');
const app = express();


// Endpoints
const hello = require('./functions/hello.js');
const summary = require('./functions/summary.js');
const departures = require('./functions/departures.js');

// app.use(express.static('public'));
// app.get('/', hello);
// app.get('/v1/summary', summary);
// app.get('/v1/departures', departures);

app.get('/test', (req, res) => {
  res.send("I'm fine!");
});

exports.index = require('express-on-serverless')(app);