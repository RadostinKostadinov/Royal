import 'dotenv/config';
import express from 'express';
import { mongoConfig } from './config/database.js';
import { expressConfig } from './config/express.js';
import { routesConfig } from './config/routes.js';


const app = express();
const port = process.env.PORT || 80;

mongoConfig();
expressConfig(app, express);
routesConfig(app);

app.listen(port, () => console.log(`Node listening on port ${port}!`));