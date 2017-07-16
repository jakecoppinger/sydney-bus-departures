'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const express = require('express');
const app = express();
const BusStopDepartures = require('./BusStopDepartures.js');
const DeparturesFormatter = require('./DeparturesFormatter.js');

const apikey = process.env.TFNSW_KEY;

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/v1/summary', function (req, res) {
    let stopID = req.query.stop;
    let routes = req.query.routes.split(',');
    let num = req.query.num;

    console.log(`/v1/summary  stopID: ${stopID}, routes:${JSON.stringify(routes)}, num:${num}`);

    let stop = new BusStopDepartures(apikey);

    stop.getDeparturesForStop(stopID, () => {
        const formatter = new DeparturesFormatter(stop.data());
        res.send(formatter.routeSummaryString(routes, 3));
    });
});

app.get('/v1/departures', function (req, res) {
    let stopID = req.query.stop;
    console.log(`/v1/departures  stopID: ${stopID}`);

    let stop = new BusStopDepartures(apikey);
    stop.getDeparturesForStop(stopID, () => {
        res.send(stop.data());
    });
});

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('sydney-bus-departures running on port ' + port);
});