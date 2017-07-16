sydney-bus-departures
=====================

>   A simple API for realtime Sydney bus departures

The [Transport for NSW Open Data](https://opendata.transport.nsw.gov.au/dataset/trip-planner-apis) initiative is awesome, but I wanted a more lightweight API.

**Very early stage and may change! Please email me if you find this useful so I can let you know of changes.**

# Endpoints

## GET `/v1/summary`

If you want a super simple way to get realtime data for one or more routes from a given stop.

### Example

[https://sydney-bus-departures.herokuapp.com/v1/summary?stop=203220&routes=396,394&num=3](https://sydney-bus-departures.herokuapp.com/v1/summary?stop=203220&routes=396,394&num=3)

```
Response
396/394: 3m,15m,26m
```

### Spec

```
https://sydney-bus-departures.herokuapp.com/v1/summary?stop=STOP&routes=ROUTES&num=NUM
```
**Query string**

- `STOP`: the 6 digit stop code to query
- `ROUTES`: comma separated list of bus routes to query (eg `396,394`)
- `NUM`: number of results to return

**Response**

- Results are realtime by default, square brackets indicate *scheduled* departure, rather than *realtime*
- Results are the soonest departures for *all given bus routes*
- The upstream API only provides minutes and no seconds, so treat responses with **± 30 seconds accuracy**

## GET `/v1/departures`

All the best data for your desired stop!

### Example

[https://sydney-bus-departures.herokuapp.com/v1/departures?stop=203220](https://sydney-bus-departures.herokuapp.com/v1/departures?stop=203220)

```
Response:
[  
  {  
    "realtimeEnabled":true,
    "departureTimePlanned":"2017-07-16T12:30:00Z",
    "departureTimeEstimated":"2017-07-16T12:29:00Z",
    "number":"394",
    "destination":"CITY Circular Quay"
  },
  {  
    "departureTimePlanned":"2017-07-16T12:39:00Z",
    "number":"396",
    "destination":"CITY Circular Quay"
  },
  {  
    "departureTimePlanned":"2017-07-16T12:44:00Z",
    "number":"393",
    "destination":"Railway Square"
  },
...
]
```

### Spec

```
https://sydney-bus-departures.herokuapp.com/v1/departures?stop=STOP
```
**Query string**

- `STOP`: the 6 digit stop code to query

**Response**

- Times are in GMT
- The upstream API only provides minutes and no seconds, so treat responses with **± 30 seconds accuracy**
- There is no output about bus capacity yet, but I'm looking into implementing it

## Development

Written in ES6 JavaScript running behind an Express webserver. The API key is pulled from the `$TFNSW_KEY` bash environment variable.

To get started:

```
npm install
npm start
# node server.js works too
```

## Pebble app
I also built a basic Pebble app which uses this data, see my [pebble-sydney-bus-departures](https://github.com/jakecoppinger/pebble-sydney-bus-departures) repo for details.

## Handy links

## Transport for NSW Documentation
[opendata.transport.nsw.gov.au/dataset/trip-planner-apis](https://opendata.transport.nsw.gov.au/dataset/trip-planner-apis)

## Online JSON viewer
For large JSON responses when dealing with the original API  
[jsonviewer.stack.hu/](http://jsonviewer.stack.hu/)

# Author

Jake Coppinger  
[jakecoppinger.com](https://jakecoppinger.com)  
[jake@jakecoppinger.com](mailto:jake@jakecoppinger.com)