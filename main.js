'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

var fs = require('fs');
var BusStopDepartures = require('./BusStopDepartures.js');
const apikey = process.env.TFNSW_KEY;
const moment = require("moment");

const prettyPrint = (json) => {
    return JSON.stringify(json,null,2);
};

const dumpJSON = (json) => {
    console.log(prettyPrint(json));
};

const setupStop = (stop, useCache, callback) => {
    if(useCache) {
        fs.readFile('data/cache.json', 'utf8', function (err,output) {
            if (err) {
                return console.log(err);
            }

            stop.setResponseForStop(JSON.parse(output));
            stop.setCacheUse(true);
            callback();
        });
    } else {
        callback();
    }
};






let main = () => {
    let stop = new BusStopDepartures(apikey);
    const stopID = "203220";
    const useCache = true;

    setupStop(stop, useCache, ()=> {
        stop.getDeparturesForStop(stopID, () => {
            const data = stop.lastRequestData();
            console.log(stop.departuresBoardString());
            //dumpJSON(data);
            console.log("////");
            console.log(stop.stoppingServices());
            console.log("--------");
            console.log(stop.routeSummaryString(["396", "394"], 3));
        });
    });
};
main();