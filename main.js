'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const moment = require("moment");
const request = require('request');
var fs = require('fs');
var JSONFieldExtrator = require('./JSONFieldExtractor.js');

const apikey = process.env.TFNSW_KEY;

const m = moment();
const date = m.format("YYYYMMDD");
const time = m.format("kkmm");

const prettyPrint = (json) => {
    return JSON.stringify(json,null,2);
};

const dumpJSON = (json) => {
    console.log(prettyPrint(json));
};

const options = {
    uri: 'https://api.transport.nsw.gov.au/v1/tp/departure_mon',
    method: 'GET',
    headers: {
        'Authorization': 'apikey ' + apikey,
        'Accept': 'application/json'
    },
    qs: {
        "TfNSWDM":true,
        "outputFormat":"rapidJSON",
        "coordOutputFormat":"EPSG:4326",
        "mode":"direct",
        "type_dm": "stop",
        "name_dm": "203327",
        "nameKey_dm":"",
        "depArrMacro":"dep",
        "itdDate":date, //"20170713",
        "itdTime":time, //"2304",
        "version":"10.2.2.48"
    }
};

const processData = (jsonData) => {
    const rawBuses = jsonData.stopEvents;
    const busesMinusAllStops = [];

    // Remove stopIDglobalID
    rawBuses.forEach((bus) => {
        const newBus = bus;
        newBus.infos[0].properties.stopIDglobalID = undefined;
        busesMinusAllStops.push(newBus);
    });

    const desiredFields = {
        "isRealtimeControlled":null,
        "departureTimePlanned":null,
        "departureTimeEstimated":null,
        "transportation": {
            "number": null,
            "description": null,
            "origin": {
                "name": null
            },
            "destination": {
                "name":null
            }
        }
    };

    // Can use rawBuses
    const extractedBusFields = [];
    busesMinusAllStops.forEach((bus) => {
        const extractor = new JSONFieldExtrator(bus);
        const newBus = extractor.extractFields(desiredFields);
        extractedBusFields.push(newBus);
    });

    const fieldsToReformat = {
        "realtimeEnabled":"isRealtimeControlled",
        "departureTimePlanned":"departureTimePlanned",
        "departureTimeEstimated":"departureTimeEstimated",
        "number":["transportation","number"]
    };



    const reformatBus = (bus) => {
        const newBus = {};
        Object.keys(fieldsToReformat).forEach((newField)=>{
            const oldFields = fieldsToReformat[newField];
            if(Array.isArray(oldFields)) {
                // Recursive on newValue
                newBus[newField] = oldFields.reduce(
                    (prevVal, elem) => prevVal[elem]
                    );
            } else {
                newBus[newField] = bus[oldFields];
            }
        });
        return newBus;
    };

    const reformattedBuses = [];
    extractedBusFields.forEach((bus) => {
        reformattedBuses.push(reformatBus(bus));
    });

    dumpJSON(reformattedBuses);
};

const writeCache = (str) => {
    fs.writeFile(
        'data/cache.json',
        str,(err) => {
            if (err) return console.log(err);
        }
    );
};

const callback = (error, response, body) => {
    if (error) {
        console.log(error);
        return;
    }
    if (response.statusCode == 200) {
        writeCache(body);
        processData(JSON.parse(body));
    } else {
        console.log("receive status code : " + response.statusCode);
    }
};

const useCache = true;

if(useCache) {
    fs.readFile('data/cache.json', 'utf8', function (err,output) {
        if (err) {
            return console.log(err);
        }
        const data = JSON.parse(output);
        processData(data);

    });
} else {
    const req = request(options, callback);
}