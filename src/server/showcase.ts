import type { Express, Request, Response } from 'express';
import { pool } from '../db/index.ts';
import { buildSiteDocument, demoByAddress } from '../lib/siteData.ts';

const BADGE =
  '<div style="position:fixed;right:12px;bottom:12px;z-index:9999;font:600 13px system-ui,sans-serif">' +
  '<a href="/" style="display:inline-block;padding:8px 14px;border-radius:999px;background:#2347f0;color:#fff;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,.25)">Made with BuildIt</a>' +
  '</div>';

/**
 * Public pages at /p/<address>. The demo sites of the showcase are served from the shared data file,
 * so they work even if the database is down. Other published projects are read from the database.
 * Every page is sent with a sandbox policy: no scripts can run in it and it cannot reach the app.
 */
export function registerPublishedRoutes(app: Express): void {
  app.get('/p/:address', async (req: Request, res: Response) => {
    const address = String(req.params.address || '').toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(address)) {
      res.status(404).type('text/plain').send('Page not found');
      return;
    }

    let title = '';
    let html = '';
    let css = '';

    const demo = demoByAddress(address);
    if (demo) {
      title = demo.title;
      html = demo.html;
      css = demo.css;
    } else {
      try {
        const result = await pool.query(
          `SELECT title, canvas_data FROM projects WHERE address = $1 AND status = 'published' AND visibility = 'public' LIMIT 1`,
          [address]
        );
        const row = result.rows[0];
        if (row) {
          const canvas = typeof row.canvas_data === 'string' ? JSON.parse(row.canvas_data) : row.canvas_data;
          title = String(row.title || 'BuildIt page');
          html = String((canvas && canvas.html) || '');
          css = String((canvas && canvas.css) || '');
        }
      } catch (err: any) {
        console.warn('[BuildIt] Could not read published page:', err?.message || err);
      }
    }

    if (!title) {
      res.status(404).type('text/plain').send('Page not found');
      return;
    }

    res.set({
      'Content-Security-Policy':
        "sandbox; default-src 'none'; style-src 'unsafe-inline' https:; img-src https: data:; font-src https: data:; base-uri 'none'; form-action 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'public, max-age=60'
    });
    res.status(200).type('html').send(buildSiteDocument(title, html, css, BADGE));
  });
}
