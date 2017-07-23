'use strict';
/*jslint node: true */
/*jshint esversion: 6 */


const app = require('./app');

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('sydney-bus-departures running on port ' + port);
});