import 'reflect-metadata';

import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import config from './config/config';
import userRoutes from './routes/users.routes';
import carRoutes from './routes/cars.routes';
import parkingRoutes from './routes/parking.routes';
import adminRoutes from './routes/admin.routes';
import userAuth from './middleware/userAuth';
import dataSource from './config/db';
import isAdmin from './middleware/isAdmin';
import 'dotenv/config';

const app = express();

// Establish database connection
dataSource
    .initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err);
    });

/** Parse the body of the request */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/** Cors */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

/** Routes */
app.use('/users', userRoutes);
app.use('/cars', userAuth, carRoutes);
app.use('/parking', userAuth, parkingRoutes);
app.use('/admin', userAuth, isAdmin, adminRoutes);

/** Error handling */
app.use((req, res, next) => {
    const error = new Error('Route not found');

    res.status(404).json({
        message: error.message
    });
});

// Start the server
const httpServer = http.createServer(app);
httpServer.listen(config.server.port, () => console.log(`Server is running ${config.server.hostname}:${config.server.port}`));

export default app;