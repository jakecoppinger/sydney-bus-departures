'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const moment = require("moment");

const DeparturesFormatter = function(data) {
    let _data = data;

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

        const selectedBuses = _data.filter(
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
        _data.forEach((bus) => {
            if(routes.indexOf(bus.number) == -1) {
                routes.push(bus.number);
            }
        });
        return routes;
    };


    this.departuresBoardJSON = () => {
        const now = moment();
        return _data.map((bus) => {
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

module.exports = DeparturesFormatter;