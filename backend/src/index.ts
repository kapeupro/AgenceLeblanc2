import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { join } from 'path';
import { existsSync } from 'fs';
import { authRoutes } from './routes/auth';
import { propertiesRoutes } from './routes/properties';
import { uploadRoutes } from './routes/upload';
import { contactRoutes } from './routes/contact';
import { alertsRoutes } from './routes/alerts';
import { teamRoutes } from './routes/team';
import { settingsRoutes } from './routes/settings';

// Chaîne API : c'est ce type qui est exporté pour le client Eden Treaty.
const api = new Elysia()
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
  .get('/health', () => ({ status: 'ok' }));

// En production, la même app Bun sert aussi le SPA buildé (frontend/dist) :
// même origine → pas de CORS, cookies d'auth OK. En dev (pas de build), on
// ne monte rien et le front tourne via Vite (proxy /api + /uploads → :3001).
const distDir = join(import.meta.dir, '../../frontend/dist');
const indexHtml = join(distDir, 'index.html');
const serveSpa = existsSync(indexHtml);

const app = serveSpa
  ? api
      .use(staticPlugin({ assets: distDir, prefix: '/' }))
      .get('/', () => Bun.file(indexHtml))
      // Fallback SPA : toute route inconnue non-API renvoie index.html pour que
      // les deep links (/admin, /biens/:slug) marchent au rechargement.
      .onError(({ code, request }) => {
        if (code === 'NOT_FOUND') {
          const path = new URL(request.url).pathname;
          if (!path.startsWith('/api') && !path.startsWith('/uploads')) {
            // Response explicite : statut 200 faisant autorité (sinon Elysia
            // conserve le 404 de l'erreur NOT_FOUND).
            return new Response(Bun.file(indexHtml), {
              status: 200,
              headers: { 'content-type': 'text/html; charset=utf-8' },
            });
          }
        }
      })
  : api;

app.listen(Number(process.env.PORT ?? 3001));

console.log(
  `🚀 Backend sur http://localhost:${process.env.PORT ?? 3001}` +
  (serveSpa ? ' — sert aussi le SPA (frontend/dist)' : ' — API seule (pas de build frontend)')
);

export type App = typeof api;
