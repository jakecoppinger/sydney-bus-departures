#!/bin/bash
set -e
jshint --reporter=node_modules/jshint-stylish JSONFieldExtractor.js BusStopDepartures.js main.js
node main.js