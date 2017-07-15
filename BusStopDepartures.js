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
    let _lastResponse = null;
    let _lastReformattedResponse = null;

    const _desiredFields = {
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

    const _fieldsToReformat = {
        "realtimeEnabled":"isRealtimeControlled",
        "departureTimePlanned":"departureTimePlanned",
        "departureTimeEstimated":"departureTimeEstimated",
        "number":["transportation","number"],
        "description":["transportation", "description"],
        "origin":["transportation","origin","name"],
        "destination":["transportation", "destination", "name"]
    };

    this.setCacheUse = (useCache) => {
        _useCache = useCache;
    };

    // Set response from cache
    this.setResponseForStop = (input) => {
        _tfnswData = input;
    };

    this.lastRequestData = () => {
        return _lastReformattedResponse;
    };

    // The main function for getting data from TfNSW
    // **Calls callback when data ready**
    this.getDeparturesForStop = (stop, callback) => {
        this._getResponseForStop(stop, () => {
            _lastReformattedResponse = this._processData(_tfnswData);
            callback();
        });
    };

    // Runs callback when response is ready
    // Either runs HTTP request or calls back immediately for cache
    this._getResponseForStop = (stop, callback) => {
        if(_useCache) {
            callback();
        } else {
            this.requestResponseForStop(stop, () => callback());
        }
    };

    // Run HTTP request for data. Runs callback when done
    this.requestResponseForStop = (stop, callback) => {
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

        const requestCallback = (error, response, body) => {
            if (error) {
                console.log(error);
                return;
            }
            if (response.statusCode == 200) {
                // Money line!
                _tfnswData = JSON.parse(body);
                callback();
            } else {
                console.log("ERROR: requestResponseForStop: received status code : " + response.statusCode);
            }
        };

        const req = request(options, requestCallback);
    };

    // Processes the raw return body into selected data
    this._processData = function(data) {
        // Remove stopIDglobalID
        // rawBuses.forEach((bus) => {
        //     const newBus = bus;
        //     newBus.infos[0].properties.stopIDglobalID = undefined;
        //     busesMinusAllStops.push(newBus);
        // });

        const rawBuses = data.stopEvents;
        const extractedBusFields = rawBuses.map((bus) => {
            const extractor = new JSONFieldExtrator(bus);
            return extractor.extractFields(_desiredFields);
        });

        const reformatBus = (bus) => {
            const newBus = {};
            Object.keys(_fieldsToReformat).forEach((newField)=>{
                const oldFields = _fieldsToReformat[newField];
                if(Array.isArray(oldFields)) {
                    // Recursive on newValue
                    const newValue = oldFields.reduce(
                        (prevVal, elem) => prevVal[elem],
                        bus);
                    newBus[newField] = newValue;
                } else {
                    newBus[newField] = bus[oldFields];
                }
            });
            return newBus;
        };

        return extractedBusFields.map(
            oldBus => reformatBus(oldBus)
        );
    };

    this._minutesUntilArrival = bus => {
        const now = moment();
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
            "minutes": minutes,
            "realtime": realtime
        };
    };

    // Create summary string of selected routes
    // eg "396,394: 6m,[6m],[6m]"
    this.routeSummaryString = (routes,numDeparturesRaw) => {
        let output = routes.join("/") + ": ";

        const selectedBuses = _lastReformattedResponse.filter(
            bus => routes.indexOf(bus.number) != -1);  

        let arrivalLengths = selectedBuses.map(
            bus => this._minutesUntilArrival(bus));

        // Sort arrivals by soonest first
        arrivalLengths.sort((a,b)=>a.minutes - b.minutes);

        // Only show first `numDepartures` arrivals
        let numDepartures = arrivalLengths.length;
        if(numDepartures != -1) {
            numDepartures = numDeparturesRaw;
        }

        for(let i = 0; i < numDepartures; i++) {
            const duration = arrivalLengths[i];

            if(duration.realtime) {
                output += duration.minutes + "m";
            } else {
                output += "[" + duration.minutes + "m]";
            }

            if(i != numDepartures - 1) {
               output += ","; 
            }
        }
        return output;
    };

    // Return array of routes that are arriving in the data
    this.stoppingServices = () => {
        let routes = [];
        _lastReformattedResponse.forEach((bus) => {
            if(routes.indexOf(bus.number) == -1) {
                routes.push(bus.number);
            }
        });
        return routes;
    };


    this.departuresBoardJSON = () => {
        const now = moment();
        return _lastReformattedResponse.map((bus) => {
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

    this.departuresBoardString = () => {
        let output = "";
        let departureLines = this.departuresBoardJSON();

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

    return this;
};

module.exports = BusStopDepartures;