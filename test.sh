#!/bin/bash
set -e

echo "hello:"
curl "http://localhost:3000/"
echo ""

echo "Summary:"
curl "http://localhost:3000/v1/summary?stop=203220&routes=394,396,399&num=3"
echo ""


#echo "Departures:"
#curl "http://localhost:3000/v1/departures?stop=203220"
#echo ""