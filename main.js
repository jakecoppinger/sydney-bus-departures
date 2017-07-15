'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const moment = require("moment");
const request = require('request');
var fs = require('fs');

var BusStopDepartures = require('./BusStopDepartures.js');

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


const writeCache = (str) => {
    fs.writeFile(
        'data/cache.json',
        str,(err) => {
            if (err) return console.log(err);
        }
    );
};

const depaturesResponseHandler = (output) => {
    const data = JSON.parse(output);
    var depatures = new BusStopDepartures(data);
    dumpJSON(depatures.getDepartures());
};

const callback = (error, response, body) => {
    if (error) {
        console.log(error);
        return;
    }
    if (response.statusCode == 200) {
        writeCache(body);
        depaturesResponseHandler(body);
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
        depaturesResponseHandler(output);
    });
} else {
    const req = request(options, callback);
}