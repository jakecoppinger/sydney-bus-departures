'use strict';
/*jslint node: true */
/*jshint esversion: 6 */
var JSONFieldExtrator = require('./JSONFieldExtractor.js');


const BusStopDepartures = function(data) {
    const _data = data;
    let _cleanedDepartures = _processData();

    this.getDepartures = () => {
        return _cleanedDepartures;
    };

    function _processData() {
        const rawBuses = _data.stopEvents;
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