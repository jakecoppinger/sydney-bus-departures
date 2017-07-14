'use strict';

/*jslint node: true */
/*jshint esversion: 6 */

const moment = require("moment");
const request = require('request');
var fs = require('fs');
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

const addFields = (desiredFields, input) => {
    const output = {};

    for(const key in desiredFields) {
        const value = desiredFields[key];
        if(value == null) {
            output[key] = input[key];
        } else {
            output[key] = addFields(value, input[key]);
        }
    }
    return output;
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

    const cleanBuses = [];

    const desiredFields = {
        "isRealtimeControlled":null,
        "departureTimePlanned":null,
        "departureTimeEstimated":null,
        "transportation": {
            "number": null,
            "origin": {
                "name": null
            }
        }
    };

    busesMinusAllStops.forEach((bus) => {
        const newBus = addFields(desiredFields, bus);



       cleanBuses.push(newBus);
    });
    dumpJSON(cleanBuses);
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
    fs.readFile('data/cache.json', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      processData(JSON.parse(data));
    });
} else {
    const req = request(options, callback);
}