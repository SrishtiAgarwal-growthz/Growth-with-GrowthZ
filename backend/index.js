import express from 'express';
import dotenv from 'dotenv';
import { configureCORS } from './src/middlewares/cors.js';
import routes from './src/routes/server.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(configureCORS);
app.use('/api', routes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export default app;
