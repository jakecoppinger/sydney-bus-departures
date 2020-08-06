import {BusStopDepartures} from '../BusStopDepartures';

export function departures(req: any, res: any) {
    let stopID = req.query.stop;
    console.log(`/v1/departures  stopID: ${stopID}`);

    let stop = new (BusStopDepartures as any)(process.env.TFNSW_KEY);
    stop.getDeparturesForStop(stopID, () => {
        res.send(stop.data());
    });
};