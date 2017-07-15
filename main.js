'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

var fs = require('fs');
var BusStopDepartures = require('./BusStopDepartures.js');
const apikey = process.env.TFNSW_KEY;

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



let myStops = {
    "anzac to city": "203220",
    "370 to coogee": "203255"
};

let main = () => {
    let stop = new BusStopDepartures(apikey);
    const stopID = myStops["anzac to city"];
    const useCache = false;

    setupStop(stop, useCache, ()=> {
        stop.getDeparturesForStop(stopID, (data) => {
            dumpJSON(data);
        });
    });
};
main();