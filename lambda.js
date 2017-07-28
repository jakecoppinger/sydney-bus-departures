'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')
var server = awsServerlessExpress.createServer(app);


module.exports.handler = (event, context) => 
    awsServerlessExpress.proxy(server, event, context)