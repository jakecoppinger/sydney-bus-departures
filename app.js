'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const express = require('express');
const app = express();

// Endpoints
const hello = require('./functions/hello.js');
const summary = require('./functions/summary.js');
const departures = require('./functions/departures.js');

// Routing
app.use(express.static('public'));
app.get('/', hello);
app.get('/v1/summary', summary);
app.get('/v1/departures', departures);

// var port = process.env.PORT || 3000;

//exports.index = require("express-with-serverless")(app)


// app.listen(port, function () {
//   console.log('sydney-bus-departures running on port ' + port);
// });

module.exports = app;