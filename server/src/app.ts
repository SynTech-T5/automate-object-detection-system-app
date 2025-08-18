import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes';


export const app: Application = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);   // ถ้ามี reverse proxy

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api', routes);

