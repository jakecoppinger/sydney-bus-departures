import * as express from 'express';
const app = express();

// // Endpoints

import {hello} from './functions/hello';
import {summary } from './functions/summary';
import {departures} from './functions/departures'

// // Routing
app.use(express.static('public'));
app.get('/hello', hello);
app.get('/v1/summary', summary);
app.get('/v1/departures', departures);

export default app;