import app from './app';

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('sydney-bus-departures running on port ' + port);
});