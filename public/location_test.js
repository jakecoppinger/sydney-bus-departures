Number.prototype.toRadians = function() {
   return this * Math.PI / 180;
};

function distance(position1,position2){
    var lat1=position1.latitude;
    var lat2=position2.latitude;
    var lon1=position1.longitude;
    var lon2=position2.longitude;
    var R = 6371000; // metres
    var φ1 = lat1.toRadians();
    var φ2 = lat2.toRadians();
    var Δφ = (lat2-lat1).toRadians();
    var Δλ = (lon2-lon1).toRadians();

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;
    return d;
}

var endpoint = "http://192.168.0.5:3000/v1/closestfavourites";

var stops = [{
        name: "UNSW > Central",
        query: endpoint + "?stop=203220&routes=391,393,395,M10&num=3",
        location: {
            latitude: -33.9196156,
            longitude: 151.2264216
        }
    },
    {
        name: "UNSW > Coogee",
        query: endpoint + "?stop=203255&routes=370&num=3",
        location: {
            latitude: -33.9196156,
            longitude: 151.2264216
        }
    },
    {
        name: "Central > UNSW",
        query:endpoint + "?stop=200053&routes=391,393,395,M10&num=3",
        location: {
            latitude:-33.8826211,
            longitude:151.2057309
        }
    },
    {
        name: "Coogee > UNSW",
        query:endpoint + "?stop=203471&routes=370&num=3",
        location: {
            latitude: -33.9206252,
            longitude:151.2568289
        }
    }
];

var myLocation = {
    latitude: -33.9163972,
    longitude: 151.230064
};

var stopDistances = {};
var closestStops = [];

for(var index in stops) {
    var stop = stops[index];
    var stopName = stop.name;
    var dist = distance(stop.location, myLocation);
    stop.distance = dist;
    stopDistances[stopName] = dist;
}

stops.sort( function(stop1, stop2) {
    return stopDistances[stop1.name] - stopDistances[stop2.name];
});

console.log(JSON.stringify(stops,null,2));
