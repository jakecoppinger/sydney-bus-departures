'use strict';
/*jslint node: true */
/*jshint esversion: 6 */
var fs = require('fs');

var BusStopDepartures = require('./BusStopDepartures.js');
const apikey = process.env.TFNSW_KEY;

const writeString = (str) => {
    fs.writeFile(
        'data/cache.json',
        str,(err) => {
            if (err) return console.log(err);
        }
    );
};

var stopID = "203327";
var stop = new BusStopDepartures(apikey);

stop.requestResponseForStop(stopID, (data) => {
    writeString(JSON.stringify(data,null,2));
});
