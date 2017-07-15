'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const JSONFieldExtrator = require('./JSONFieldExtractor.js');
const moment = require("moment");
const request = require('request');

const BusStopDepartures = function(apikey) {
    let _tfnswData = null;
    const _apikey = apikey;
    let _useCache = false;

    this.setCacheUse = (useCache) => {
        _useCache = useCache;
    };

    this.setResponseForStop = (input) => {
        _tfnswData = input;
    };

    this._getResponseForStop = (stop, callback) => {
        if(_useCache) {
            callback(_tfnswData);
        } else {
            this.requestResponseForStop(stop, (data) => callback(data));
        }
    };

    this.requestResponseForStop = (stop, callback) => {
        const requestCallback = (error, response, body) => {
            if (error) {
                console.log(error);
                return;
            }
            if (response.statusCode == 200) {
                callback(JSON.parse(body));
            } else {
                console.log("ERROR: requestResponseForStop: received status code : " + response.statusCode);
            }
        };

        const m = moment();
        const date = m.format("YYYYMMDD");
        const time = m.format("kkmm");

        const options = {
            uri: 'https://api.transport.nsw.gov.au/v1/tp/departure_mon',
            method: 'GET',
            headers: {
                'Authorization': 'apikey ' + _apikey,
                'Accept': 'application/json'
            },
            qs: {
                "TfNSWDM":true,
                "outputFormat":"rapidJSON",
                "coordOutputFormat":"EPSG:4326",
                "mode":"direct",
                "type_dm": "stop",
                "name_dm": stop,
                "nameKey_dm":"",
                "depArrMacro":"dep",
                "itdDate":date, //"20170713",
                "itdTime":time, //"2304",
                "version":"10.2.2.48"
            }
        };

        const req = request(options, requestCallback);
    };

    this.getDeparturesForStop = (stop, callback) => {
        this._getResponseForStop(stop, (data) => {
            callback(_processData(data));
        });
    };

    function _processData(data) {
        const rawBuses = data.stopEvents;
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
        const extractedBusFields = busesMinusAllStops.map((bus) => {
            const extractor = new JSONFieldExtrator(bus);
            return extractor.extractFields(desiredFields);
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

        const reformattedBuses = extractedBusFields.map(
            oldBus => reformatBus(oldBus)
        );
        return reformattedBuses;
    }


    return this;
};

module.exports = BusStopDepartures;