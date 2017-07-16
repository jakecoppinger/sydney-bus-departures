var currentStop = 0;
var programStart = new Date();

var stops = [{
        name: "UNSW > Central",
        query: "http://192.168.0.5:3000/v1/summary?stop=203220&routes=391,393,395,M10&num=3"
    },
    {
        name: "UNSW > Coogee",
        query: "http://192.168.0.5:3000/v1/summary?stop=203255&routes=370&num=3"
    },
    {
        name: "Central > UNSW",
        query:"http://192.168.0.5:3000/v1/summary?stop=200053&routes=391,393,395,M10&num=3"
    },
    {
        name: "Coogee > UNSW",
        query:"http://192.168.0.5:3000/v1/summary?stop=203471&routes=370&num=3"
    }
];

simply.fullscreen(true);
simply.title("Hello!");

updateData();


navigator.geolocation.getCurrentPosition(function(pos) {
    var coords = pos.coords;
    simply.subtitle(JSON.stringify(coords.longitude));

    // var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather?' +
    //   'lat=' + coords.latitude + '&lon=' + coords.longitude + '&units=metric';
    // ajax({ url: weatherUrl, type: 'json' }, function(data) {
    //     simply.text({ title: data.name, subtitle: data.main.temp });
    // });
});

function updateData() {
    // var now = new Date();
    // var output = "";
    // var dif = now.getTime() - programStart.getTime();
    // var Seconds_from_T1_to_T2 = dif / 1000;
    // var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
    // output += "s: " + Seconds_Between_Dates;
    //output += data;

    // var loadingText = "...";
    // simply.title(stops[currentStop].name + loadingText);
    // simply.subtitle("");

    // ajax({ url: stops[currentStop].query }, function(data){
    //     simply.title(stops[currentStop].name);
    //     simply.subtitle(data);
    // });



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
  