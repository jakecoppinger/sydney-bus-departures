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
  res.send('Hello World!' + new Date());
});


/*
Route path: /users/:userId/books/:bookId
Request URL: http://localhost:3000/users/34/books/8989
req.params: { "userId": "34", "bookId": "8989" }
To define routes with route parameters, simply specify the route parameters in the path of the route as shown below.

app.get('/users/:userId/books/:bookId', function (req, res) {
  res.send(req.params)
})
*/

//http://server/url?array=["foo","bar"]

app.get('/v1/summary', function (req, res) {
    let stopID = req.query.stop;
    let routes = req.query.routes.split(',');
    let num = req.query.num;

    console.log("query: ", req.query);

    let stop = new BusStopDepartures(apikey);

    stop.getDeparturesForStop(stopID, () => {
        const formatter = new DeparturesFormatter(stop.data());
        res.send(formatter.routeSummaryString(routes, 3));
    });
});

app.get('/test', function (req, res) {
    res.send("hello " + new Date()); //formatter.routeSummaryString(["396", "394"], 3));
    res.end();
});


app.post('/test', function(req, res) {
    console.log("hell wo");
    console.log(req.headers);

    res.send("hello");
});

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('sydney-bus-departures running on port ' + port);
});