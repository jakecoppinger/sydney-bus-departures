'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const BusStopDepartures = require('../BusStopDepartures.js');

module.exports = function (req, res) {
    let stopID = req.query.stop;
    console.log(`/v1/departures  stopID: ${stopID}`);

    let stop = new BusStopDepartures(process.env.TFNSW_KEY);
    stop.getDeparturesForStop(stopID, () => {
        res.send(stop.data());
    });
};