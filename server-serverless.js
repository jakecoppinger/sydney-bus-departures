'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const server = require('./server.js');
const expressOnServerless = require('express-on-serverless');

exports.express = expressOnServerless(server.app);