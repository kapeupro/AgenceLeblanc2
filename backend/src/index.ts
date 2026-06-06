import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { join } from 'path';
import { authRoutes } from './routes/auth';
import { propertiesRoutes } from './routes/properties';
import { uploadRoutes } from './routes/upload';
import { contactRoutes } from './routes/contact';
import { alertsRoutes } from './routes/alerts';
import { teamRoutes } from './routes/team';
import { settingsRoutes } from './routes/settings';

const app = new Elysia()
  .use(cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  }))
  .use(staticPlugin({
    assets: join(import.meta.dir, '../uploads'),
    prefix: '/uploads',
  }))
  .use(authRoutes)
  .use(propertiesRoutes)
  .use(uploadRoutes)
  .use(contactRoutes)
  .use(alertsRoutes)
  .use(teamRoutes)
  .use(settingsRoutes)
  .get('/health', () => ({ status: 'ok' }))
  .listen(Number(process.env.PORT ?? 3001));

console.log(`🚀 Backend running on http://localhost:${process.env.PORT ?? 3001}`);

export type App = typeof app;
