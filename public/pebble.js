var development = false;

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


var currentStop = 0;
var programStart = new Date();

var endpoint = "https://sydney-bus-departures.herokuapp.com/v1/summary";

if(development) {
    endpoint = "http://192.168.0.5:3000/v1/summary";
}


// var stops = [{
//         name: "UNSW > Central",
//         query: endpoint + "?stop=203220&routes=391,393,395,M10&num=3",
//         lat: -33.9196156,
//         long: 151.2264216
//     },
//     {
//         name: "UNSW > Coogee",
//         query: endpoint + "?stop=203255&routes=370&num=3",
//         lat: -33.9196156,
//         long: 151.2264216
//     },
//     {
//         name: "Central > UNSW",
//         query:endpoint + "?stop=200053&routes=391,393,395,M10&num=3",
//         lat:-33.8826211,
//         long:151.2057309
//     },
//     {
//         name: "Coogee > UNSW",
//         query:endpoint + "?stop=203471&routes=370&num=3",
//         lat: -33.9206252,
//         long:151.2568289
//     }
// ];

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


simply.fullscreen(true);
simply.title("Hello!");

var endpoint = "http://192.168.0.5:3000/v1/closestfavourites";


function sortStops(myLocation) {
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

    // console.log(JSON.stringify(stops,null,2));
}

navigator.geolocation.getCurrentPosition(function(pos) {
    var coords = pos.coords;
    sortStops(pos.coords);
    updateData();
    //simply.subtitle(coords.latitude+ " " + coords.longitude);
});

function updateData() {
    // var now = new Date();
    // var output = "";
    // var dif = now.getTime() - programStart.getTime();
    // var Seconds_from_T1_to_T2 = dif / 1000;
    // var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
    // output += "s: " + Seconds_Between_Dates;
    //output += data;

    var loadingText = "...";
    simply.title(stops[currentStop].name + loadingText);
    var humanDistance = Math.floor(stops[currentStop].distance / 100) / 10;
    simply.subtitle(humanDistance + "km");


    ajax({ url: stops[currentStop].query }, function(data){
        simply.title(stops[currentStop].name);
        simply.subtitle(data);
    });
}

simply.on('singleClick', function(e) {
    if(e.button == "select") {
        updateData();
    } else if(e.button == "down") {
        // Increase currentStop
        if(currentStop < (stops.length - 1)) {
            currentStop += 1;
        }
        updateData();
    } else if(e.button == "up") {
        // Decrease currentStop
        if(currentStop > 0) {
            currentStop -= 1;
        }
        updateData();
    } else {
        simply.subtitle('You pressed the ' + e.button + ' button!');
    }
});
  