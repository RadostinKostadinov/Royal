import 'dotenv/config';
import express from 'express';
import { startCronJobs } from './config/cron-jobs.js';
import { mongoConfig } from './config/database.js';
import { expressConfig } from './config/express.js';
import { routesConfig } from './config/routes.js';
import { socketsInitialize } from './config/sockets.js';
import http from 'http';
/* import https from 'https';
import fs from 'fs'; */
import { Server } from 'socket.io';

export const inDevMode = process.env.NODE_ENV.trim() === 'development';

const app = express();

const httpPort = process.env.HTTP_PORT || 3000;
//TODO SSL
/* const httpsPort = process.env.HTTPS_PORT || 3443;
const options = {
    key: fs.readFileSync('./config/ssl/key.pem'),
    cert: fs.readFileSync('./config/ssl/cert.pem')
}; */

const httpServer = http.createServer(app);
// const httpsServer = https.createServer(options, app);

const io = new Server(httpServer, {
    serveClient: false,
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.get('/', (req, res) => {
    res.send('hi')
})

mongoConfig();
expressConfig(app, express);
routesConfig(app);
startCronJobs();
socketsInitialize(io);

httpServer.listen(httpPort, () => console.log(`Node HTTP listening on port ${httpPort}!`));
// httpsServer.listen(httpsPort, () => console.log(`Node HTTPS listening on port ${httpsPort}!`));