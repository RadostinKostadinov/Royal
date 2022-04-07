import 'dotenv/config';
import express from 'express';
import { startCronJobs } from './config/cron-jobs.js';
import { mongoConfig } from './config/database.js';
import { expressConfig } from './config/express.js';
import { routesConfig } from './config/routes.js';
import http from 'http';
import { Server } from 'socket.io';
import { socketsInitialize } from './config/sockets.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    serveClient: false,
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const port = process.env.PORT || 80;

mongoConfig();
expressConfig(app, express);
routesConfig(app);
startCronJobs();
socketsInitialize(io);

server.listen(port, () => console.log(`Node listening on port ${port}!`));