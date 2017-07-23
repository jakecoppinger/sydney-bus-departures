'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const awsServerlessExpress = require('aws-serverless-express')

// const express = require('express');
// const app = express();

// // Endpoints
// const hello = require('./functions/hello.js');
// const summary = require('./functions/summary.js');
// const departures = require('./functions/departures.js');

// // Routing
// app.use(express.static('public'));
// app.get('/', hello);
// app.get('/v1/summary', summary);
// app.get('/v1/departures', departures);


const app = require('./app');

const server = awsServerlessExpress.createServer(app)

module.exports.index = (event, context) => awsServerlessExpress.proxy(server, event, context)