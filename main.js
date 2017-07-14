var moment = require("moment");
var request = require('request');

// Documentation
// https://opendata.transport.nsw.gov.au/dataset/trip-planner-apis

// Online JSON viewer
// http://jsonviewer.stack.hu/

/*
https://api.transport.nsw.gov.au/v1/tp/departure_mon
?TfNSWDM=true
&outputFormat=rapidJSON
&coordOutputFormat=EPSG%3A4326
&mode=direct
&type_dm=stop
&name_dm=203327
&depArrMacro=dep
&itdDate=20170713
&itdTime=2208
&version=10.2.2.48
*/

var m = moment();

var date = m.format("YYYYMMDD");
var time = m.format("kkmm");

var apikey = process.env.TFNSW_KEY;

var options = {
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

var req = request(options, function(error, response, body) {
    if (error) {
        console.log(error);
        return;
    }
    if (response.statusCode == 200) {
        console.log(body);
    } else {
        console.log("receive status code : " + response.statusCode);
    }
});