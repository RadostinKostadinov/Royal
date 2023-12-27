import 'dotenv/config';
import express from 'express';
import { startCronJobs } from './config/cron-jobs.js';
import { mongoConfig } from './config/database.js';
import { expressConfig } from './config/express.js';
import { routesConfig } from './config/routes.js';
import { socketsInitialize } from './config/sockets.js';
import http from 'http';
import { Server } from 'socket.io';

export const app = express();

const httpPort = process.env.HTTP_PORT || 3000;
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    serveClient: false,
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

await mongoConfig(); // Added await because mocha was not waiting for server to listen before running tests
expressConfig(app, express);
routesConfig(app);
startCronJobs();
socketsInitialize(io);

httpServer.listen(httpPort, () => {
    console.log(`Node HTTP listening on port ${httpPort}!`);
    app.emit("appStarted");
});