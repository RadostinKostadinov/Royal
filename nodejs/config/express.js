import cors from 'cors';

function expressConfig(app, express) {
    // Enable CORS
    app.use(cors({ origin: '*' }));
    // Enable requests to have file-type/json 
    app.use(express.json());
}

export { expressConfig }