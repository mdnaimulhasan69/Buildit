import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expressApp } from './src/server/api.ts';
import { initDatabase } from './src/db/init.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // The site runs behind the host's proxy (Render, etc.), so trust one proxy hop.
  app.set('trust proxy', 1);

  // Simple check that does not touch the database. Hosts can use it as the health check path.
  app.get('/healthz', (_req, res) => {
    res.status(200).send('ok');
  });

  // 1. Initialize database tables and seeds if needed (Requirement 2).
  // If the database cannot be reached the site still opens, and /api/health tells why.
  try {
    await initDatabase();
  } catch (err: any) {
    console.error('[BuildIt] Database could not be prepared at start:', err?.message || err);
    console.error('[BuildIt] The site will still start. Check DATABASE_URL, then open /api/health.');
  }

  // 2. Mount API routes
  app.use(expressApp);

  // 3. Dev mode with Vite middleware or Production with static dist
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    // Fallback all SPA routes (/register, /login, /dashboard, etc.) to index.html
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BuildIt] Server listening on port ${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

process.on('unhandledRejection', (reason) => {
  console.error('[BuildIt] Unhandled promise rejection:', reason);
});

startServer().catch((err) => {
  console.error('[BuildIt] Failed to start server:', err);
  process.exit(1);
});
