import express from 'express';
import dotenv from 'dotenv';
import { configureCORS } from './src/middlewares/cors.js';
import routes from './src/routes/server.js';

dotenv.config();

const app = express();

// Middleware to parse JSON body
app.use(express.json());

// Middleware to handle CORS
app.use(configureCORS);

app.use((req, res, next) => {
    console.log('Request Body:', req.body);
    next();
});

// Debug middleware (if necessary)
app.use((req, res, next) => {
    console.log('[DEBUG] Middleware Body:', req.body);
    next();
});

// Registering routes
app.use('/api', routes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export default app;
