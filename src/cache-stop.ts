import fs from 'fs';

import {BusStopDepartures } from './BusStopDepartures'
const apikey = process.env.TFNSW_KEY;

const writeString = (str) => {
    fs.writeFile(
        'data/cache.json',
        str,(err) => {
            if (err) return console.log(err);
        }
    );
};

var stopID = "203327";
var stop = new (BusStopDepartures as any)(apikey);

stop.getDeparturesForStop(stopID, () => {
    writeString(JSON.stringify(stop.rawData(),null,2));
});
