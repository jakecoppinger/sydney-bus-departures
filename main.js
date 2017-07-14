"use strict";

const moment = require("moment");
const request = require('request');
const apikey = process.env.TFNSW_KEY;

const m = moment();
const date = m.format("YYYYMMDD");
const time = m.format("kkmm");


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

const callback = function(error, response, body) {
    if (error) {
        console.log(error);
        return;
    }
    if (response.statusCode == 200) {
        console.log(body);
    } else {
        console.log("receive status code : " + response.statusCode);
    }
};

const req = request(options, callback);