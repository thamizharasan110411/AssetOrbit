import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { assetRoutes } from './routes/assetRoutes.js';
import { assignmentRoutes } from './routes/assignmentRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { categoryRoutes } from './routes/categoryRoutes.js';
import { dashboardRoutes } from './routes/dashboardRoutes.js';
import { maintenanceRoutes } from './routes/maintenanceRoutes.js';
import { profileRoutes } from './routes/profileRoutes.js';
import { reportRoutes } from './routes/reportRoutes.js';
import { userRoutes } from './routes/userRoutes.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AssetOrbit API'
  });
});

function mountRoutes(prefix) {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);
  app.use(`${prefix}/assets`, assetRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);
  app.use(`${prefix}/assignments`, assignmentRoutes);
  app.use(`${prefix}/maintenance`, maintenanceRoutes);
  app.use(`${prefix}/reports`, reportRoutes);
  app.use(`${prefix}/profile`, profileRoutes);
  app.use(`${prefix}/users`, userRoutes);
}

mountRoutes('/api');
mountRoutes('');

app.use(notFound);
app.use(errorHandler);
