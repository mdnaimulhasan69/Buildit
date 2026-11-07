import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { TEAM, DEMO_SITES, memberBySlug } from '../lib/siteData.ts';

interface Queryable {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
}

/**
 * Creates the four team accounts and one published demo site per template, so visitors see real
 * examples on the home page. It is safe to run on every start: nothing is duplicated.
 * The team accounts cannot be used to log in (their password is random and never stored anywhere).
 */
export async function seedDemoData(client: Queryable): Promise<void> {
  // 1. Team accounts
  const existing = await client.query('SELECT user_id FROM users WHERE user_id = ANY($1::text[])', [
    TEAM.map((m) => m.userId)
  ]);
  const have = new Set<string>(existing.rows.map((r: any) => r.user_id));
  let hash: string | null = null;

  for (const m of TEAM) {
    const bio = `${m.role}, Team BuildIt. Student ID ${m.studentId}, Port City International University.`;
    if (have.has(m.userId)) {
      await client.query('UPDATE users SET name = $2, bio = $3 WHERE user_id = $1', [m.userId, m.name, bio]);
      continue;
    }
    if (!hash) {
      hash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
    }
    await client.query(
      `INSERT INTO users (user_id, name, email, password_hash, bio, role, status)
       VALUES ($1, $2, $3, $4, $5, 'user', 'active')
       ON CONFLICT DO NOTHING`,
      [m.userId, m.name, m.email, hash, bio]
    );
  }

  // 2. One published, public site per template
  for (const d of DEMO_SITES) {
    const owner = memberBySlug(d.ownerSlug);
    if (!owner) continue;
    const found = await client.query('SELECT id FROM users WHERE user_id = $1', [owner.userId]);
    if (!found.rows[0]) continue;
    const ownerId = found.rows[0].id;

    const canvas = JSON.stringify({
      templateId: d.templateId,
      templateName: d.templateName,
      html: d.html,
      css: d.css
    });

    const project = await client.query('SELECT id FROM projects WHERE address = $1 LIMIT 1', [d.address]);
    if (project.rows[0]) {
      await client.query(
        `UPDATE projects
         SET title = $2, owner_id = $3, canvas_data = $4::jsonb, status = 'published', visibility = 'public'
         WHERE id = $1`,
        [project.rows[0].id, d.title, ownerId, canvas]
      );
    } else {
      await client.query(
        `INSERT INTO projects (title, owner_id, canvas_data, status, address, visibility, price)
         VALUES ($1, $2, $3::jsonb, 'published', $4, 'public', 0)`,
        [d.title, ownerId, canvas, d.address]
      );
    }
  }

  console.log('[BuildIt] Demo accounts and demo sites are ready');
}
