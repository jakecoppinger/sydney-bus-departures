import * as moment from 'moment-timezone';
import { Bus } from './interfaces';

interface ArrivalInfo {
minutes: number;
realtime: boolean;
}


function minutesUntilArrival (bus: Bus): number {
    const ts: string = bus.realtimeEnabled ? bus.departureTimeEstimated : bus.departureTimePlanned;
    const busTimestamp = moment(ts).tz('Australia/Sydney');;
    const zeroSecondsNow = moment().set({ second: 0, millisecond: 0 });
    const duration = moment.duration(busTimestamp.diff(zeroSecondsNow));
    return duration.asMinutes();
};

export function DeparturesFormatter(data: Bus[]) {
    let _data = data;

    this._minutesUntilArrival = (bus: Bus): ArrivalInfo => {
        let timestampString: string = bus.departureTimePlanned;
        let realtime = false;

        if (typeof bus.realtimeEnabled !== "undefined") {
            timestampString = bus.departureTimeEstimated;
            realtime = true;
        }

        const busTimestamp = moment(timestampString).tz('Australia/Sydney');;
        const zeroSecondsNow = moment().set({ second: 0, millisecond: 0 });
        var duration = moment.duration(busTimestamp.diff(zeroSecondsNow));

        return {
            minutes: duration.asMinutes(),
            realtime: realtime
        };
    };

    this.routeSummaryObjString = (routes: string[], numDepartures: number) => {
        const selectedBuses = _data.filter(
            (bus: any) => routes.indexOf(bus.number) != -1);
        
        const relevant = selectedBuses.map(bus => ({
            number: bus.number,
            realtime: bus.realtimeEnabled,
            minutes: minutesUntilArrival(bus)
        }))
        const sorted = [...relevant].sort((a, b) => a.minutes - b.minutes);
        const truncated = sorted.slice(0,Math.min(numDepartures, sorted.length -1));
        return truncated;
    };
    // Create summary string of selected routes
    // eg "396,394: 6m,[6m],[6m]"
    this.routeSummaryString = (routes: string[], numDeparturesRaw: number) => {
        let output = routes.join("/") + ": ";

        const selectedBuses = _data.filter(
            (bus: any) => routes.indexOf(bus.number) != -1);

        let arrivalLengths = selectedBuses.map(
            (bus: any) => this._minutesUntilArrival(bus));

        // Sort arrivals by soonest first
        arrivalLengths.sort((a: any, b: any) => a.minutes - b.minutes);

        // Only show first `numDepartures` arrivals
        let numDepartures = arrivalLengths.length;
        if (numDepartures != -1) {
            numDepartures = Math.min(
                numDeparturesRaw, arrivalLengths.length
            );
        }

        for (let i = 0; i < numDepartures; i++) {
            const duration = arrivalLengths[i];

            if (duration.realtime) {
                output += duration.minutes + "m";
            } else {
                output += "[" + duration.minutes + "m]";
            }

            if (i != numDepartures - 1) {
                output += ",";
            }
        }
        return output;
    };

    // Return array of routes that are arriving in the data
    this.stoppingServices = () => {
        let routes: any[] = [];
        _data.forEach((bus: Bus) => {
            if (routes.indexOf(bus.number) == -1) {
                routes.push(bus.number);
            }
        });
        return routes;
    };


    this.departuresBoardJSON = () => {
        const now = moment().tz('Australia/Sydney');;
        return _data.map((bus: any) => {
            const number = bus.number;
            let timestampString = bus.departureTimePlanned;
            let realtime = false;

            if (typeof bus.realtimeEnabled !== "undefined") {
                timestampString = bus.departureTimeEstimated;
                realtime = true;
            }

            const timestamp = moment(timestampString);
            const diff = moment.duration(timestamp.diff(now));
            const minutes = diff.minutes();

            return {
                "number": number,
                "minutes": minutes,
                "realtime": realtime
            };
        });
    };

    this.departuresBoardString = () => {
        let output = "";
        let departureLines = this.departuresBoardJSON();

        departureLines.sort(function (a: any, b: any) {
            return a.minutes - b.minutes;
        });

        departureLines.forEach((departure: any) => {
            output += departure.number + ": " + departure.minutes + "m";

            if (!departure.realtime) {
                output += "  (scheduled)";
            }

            output += "\n";
        });
        return output;
    };

    return this;
};