import fs from 'fs';
import {BusStopDepartures} from './BusStopDepartures';
const DeparturesFormatter = require('./DeparturesFormatter.js');

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
    let stop = new (BusStopDepartures as any)(apikey);
    const stopID = "203255"; //"203220";
    const useCache = false;

    setupStop(stop, useCache, ()=> {
        stop.getDeparturesForStop(stopID, () => {
            const data = stop.data();
            const formatter = new DeparturesFormatter(data);
            //console.log(stop.compactData());
            //console.log(formatter.departuresBoardString());
            //dumpJSON(data);
            console.log("////");
            //console.log(formatter.stoppingServices());
            console.log("--------");
            console.log(formatter.routeSummaryString(["370"], 3));
        });
    });
};
main();