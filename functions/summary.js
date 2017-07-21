'use strict';
/*jslint node: true */
/*jshint esversion: 6 */

const BusStopDepartures = require('../BusStopDepartures.js');
const DeparturesFormatter = require('../DeparturesFormatter.js');

module.exports = function (req, res) {
    let stopID = req.query.stop;
    let routes = req.query.routes.split(',');
    let num = req.query.num;

    // Default number of arrivals is 3
    if(num === undefined) {
        num = 3;
    }

    console.log(`/v1/summary  stopID: ${stopID}, routes:${JSON.stringify(routes)}, num:${num}`);

    let stop = new BusStopDepartures(process.env.TFNSW_KEY);

    stop.getDeparturesForStop(stopID, () => {
        const formatter = new DeparturesFormatter(stop.data());
        res.send(formatter.routeSummaryString(routes, num));
    });
};