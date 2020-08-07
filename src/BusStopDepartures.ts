import {JSONFieldExtractor} from './JSONFieldExtractor';
import * as moment from "moment-timezone";
import * as request from 'request';
import {Bus} from './interfaces';


export function BusStopDepartures(apikey: string) {
    let _tfnswData: any = null;
    const _apikey = apikey;
    let _useCache = false;
    let _lastReformattedResponse:any = null;

    const _desiredFields: any = {
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

    const _fieldsToReformat:any = {
        "realtimeEnabled":"isRealtimeControlled",
        "departureTimePlanned":"departureTimePlanned",
        "departureTimeEstimated":"departureTimeEstimated",
        "number":["transportation","number"],
        //"description":["transportation", "description"],
        //"origin":["transportation","origin","name"],
        "destination":["transportation", "destination", "name"]
    };

    this.setCacheUse = (useCache: boolean) => {
        _useCache = useCache;
    };

    // Set response from cache
    this.setResponseForStop = (input: any) => {
        _tfnswData = input;
    };

    this.rawData = () => {
        return _tfnswData;
    };

    this.data = () => {
        return _lastReformattedResponse;
    };

    // The main function for getting data from TfNSW
    // **Calls callback when data ready**
    this.getDeparturesForStop = (stop: any, callback: any) => {
        this._getResponseForStop(stop, () => {
            _lastReformattedResponse = this._processData(_tfnswData);
            callback();
        });
    };

    // Runs callback when response is ready
    // Either runs HTTP request or calls back immediately for cache
    this._getResponseForStop = (stop: any, callback: any) => {
        if(_useCache) {
            callback();
        } else {
            this._requestResponseForStop(stop, () => callback());
        }
    };

    // Run HTTP request for data. Runs callback when done
    this._requestResponseForStop = (stop: any, callback: any) => {
        const m = moment().tz('Australia/Sydney');
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

        const requestCallback = (error: any, response: any, body: any) => {
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
    this._processData = function(data: any): Bus[] {
        // Remove stopIDglobalID
        // rawBuses.forEach((bus) => {
        //     const newBus = bus;
        //     newBus.infos[0].properties.stopIDglobalID = undefined;
        //     busesMinusAllStops.push(newBus);
        // });

        const rawBuses = data.stopEvents;

        const extractedBusFields = rawBuses.map((bus:any) => {
            const extractor = new (JSONFieldExtractor as any)(bus);
            return extractor.extractFields(_desiredFields);
        });

        const reformatBus = (bus: any): Bus => {
            const newBus: any = {};
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
            (oldBus: any) => reformatBus(oldBus)
        );
    };

    this.compactData = function () {
        _lastReformattedResponse.forEach((bus: any) => {
            let output = "";

            output += bus.number;
            output += "/   plan: " + bus.departureTimePlanned;
            output += "   est: " + bus.departureTimeEstimated;

            console.log(output);
        });
    };


    return this;
};
