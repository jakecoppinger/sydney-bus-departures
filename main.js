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

const departuresBoardJSON = (data) => {
    const now = moment();
    return data.map((bus) => {
        const number = bus.number;
        let timestampString = bus.departureTimePlanned;
        let realtime = false;

        if(typeof bus.realtimeEnabled!== "undefined" ) {
            timestampString = bus.departureTimeEstimated;
            realtime = true;
        }
        
        const timestamp = moment(timestampString);
        const diff = moment.duration(timestamp.diff(now));
        const minutes = diff.minutes();

        return {
            "number":number,
            "minutes":minutes,
            "realtime":realtime
        };
    });
};

const departuresBoardString = (data) => {
    let output = "";
    let departureLines = departuresBoardJSON(data);

    departureLines.sort(function(a, b) { 
        return a.minutes - b.minutes;
    });

    departureLines.forEach((departure) => {
        output += departure.number + ": " + departure.minutes + "m";

        if(!departure.realtime) {
            output += "  (scheduled)";
        }

        output += "\n";
    });
    return output;
};




// Return array of routes that are arriving in the data
const stoppingServices = (data) => {
    let routes = [];
    data.forEach((bus) => {
        if(routes.indexOf(bus.number) == -1) {
            routes.push(bus.number);
        }
    });
    return routes;
};

let main = () => {
    let stop = new BusStopDepartures(apikey);
    const stopID = "203220";
    const useCache = true;

    setupStop(stop, useCache, ()=> {
        stop.getDeparturesForStop(stopID, () => {
            const data = stop.lastRequestData();
            console.log(departuresBoardString(data));
            //dumpJSON(data);
            console.log("////");
            console.log(stoppingServices(data));
            console.log("--------");
            console.log(stop.routeSummaryString(["396", "394"], 3));
        });
    });
};
main();