import * as awsServerlessExpress from 'aws-serverless-express';
import app from './app';
var server = awsServerlessExpress.createServer(app);


module.exports.handler = (event, context) => 
    awsServerlessExpress.proxy(server, event, context)