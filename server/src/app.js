import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import healthRouter from './routes/health.js';
import patientsRouter from './routes/patients.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map(item => item.trim()),
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({
    message: 'Health Platform API is running'
  });
});

app.use('/api/health', healthRouter);
app.use('/api/patients', patientsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
