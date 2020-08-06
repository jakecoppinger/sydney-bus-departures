import { BusStopDepartures } from '../BusStopDepartures';
import { DeparturesFormatter } from '../DeparturesFormatter';

export function summary(req, res) {
    let stopID = req.query.stop;
    let routes = req.query.routes.split(',');
    let num = req.query.num;

    // Default number of arrivals is 3
    if(num === undefined) {
        num = 3;
    }

    console.log(`/v1/summary  stopID: ${stopID}, routes:${JSON.stringify(routes)}, num:${num}`);

    let stop = new (BusStopDepartures as any)(process.env.TFNSW_KEY);

    stop.getDeparturesForStop(stopID, () => {
        const formatter = new (DeparturesFormatter as any)(stop.data());
        res.send(formatter.routeSummaryString(routes, num));
    });
};