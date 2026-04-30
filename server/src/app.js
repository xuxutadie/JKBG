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
    origin: function (origin, callback) {
      // 允许所有 origin，即使没有 origin 也能通过（比如移动端、本地等）
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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
