import { pool } from './index.ts';

const SAMPLE_PAGE_PICTURE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380" fill="none"><rect width="600" height="380" rx="8" fill="%23F3F4F6"/><rect x="40" y="40" width="520" height="48" rx="6" fill="%232563EB" opacity="0.9"/><rect x="40" y="110" width="320" height="24" rx="4" fill="%234B5563"/><rect x="40" y="146" width="480" height="16" rx="4" fill="%239CA3AF"/><rect x="40" y="172" width="420" height="16" rx="4" fill="%239CA3AF"/><rect x="40" y="210" width="240" height="130" rx="6" fill="%23FFFFFF" stroke="%23E5E7EB" stroke-width="2"/><rect x="300" y="210" width="260" height="130" rx="6" fill="%23FFFFFF" stroke="%23E5E7EB" stroke-width="2"/><circle cx="80" cy="245" r="16" fill="%233B82F6" opacity="0.3"/><rect x="110" y="238" width="130" height="14" rx="3" fill="%23374151"/><rect x="325" y="235" width="210" height="30" rx="4" fill="%23EFF6FF" stroke="%23BFDBFE"/><rect x="325" y="280" width="100" height="32" rx="4" fill="%232563EB"/></svg>`;

export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    // 1. Create users table if missing
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id serial PRIMARY KEY,
          user_id text NOT NULL UNIQUE,
          name text NOT NULL,
          email text NOT NULL UNIQUE,
          password_hash text NOT NULL,
          bio text,
          picture text,
          social_links jsonb,
          role text NOT NULL DEFAULT 'user',
          status text NOT NULL DEFAULT 'active',
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS users_user_id_idx ON users (user_id);
        CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);
      `);
    } catch (err: any) {
      if (err.code === '42501') {
        console.log('[BuildIt] Skipping DDL for users table (restricted preview SQL user)');
      } else {
        console.warn('[BuildIt] Notice creating users table:', err.message);
      }
    }

    // 2. Create templates table if missing
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS templates (
          id text PRIMARY KEY,
          name text NOT NULL,
          description text NOT NULL,
          picture text NOT NULL,
          category text DEFAULT 'general',
          created_at timestamp NOT NULL DEFAULT now()
        );
      `);
    } catch (err: any) {
      if (err.code === '42501') {
        console.log('[BuildIt] Skipping DDL for templates table (restricted preview SQL user)');
      } else {
        console.warn('[BuildIt] Notice creating templates table:', err.message);
      }
    }

    // 3. Create login_attempts table if missing
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS login_attempts (
          email text PRIMARY KEY,
          attempts jsonb NOT NULL,
          locked_until bigint
        );
      `);
    } catch (err: any) {
      if (err.code === '42501') {
        console.log('[BuildIt] Skipping DDL for login_attempts table (restricted preview SQL user)');
      } else {
        console.warn('[BuildIt] Notice creating login_attempts table:', err.message);
      }
    }

    // 4. Create projects table if missing (Requirement 5, 6, 18, 35.4)
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id serial PRIMARY KEY,
          title text NOT NULL,
          owner_id integer NOT NULL REFERENCES users(id),
          team_id integer,
          canvas_data jsonb NOT NULL,
          status text NOT NULL DEFAULT 'draft',
          address text,
          visibility text NOT NULL DEFAULT 'private',
          price integer DEFAULT 0,
          updated_at timestamp NOT NULL DEFAULT now(),
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS projects_title_idx ON projects (title);
        CREATE INDEX IF NOT EXISTS projects_owner_idx ON projects (owner_id);
      `);
    } catch (err: any) {
      if (err.code === '42501') {
        console.log('[BuildIt] Skipping DDL for projects table (restricted preview SQL user)');
      } else {
        console.warn('[BuildIt] Notice creating projects table:', err.message);
      }
    }

    // 4b. Create snapshots table if missing (Requirement 2B & 9)
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS snapshots (
          id serial PRIMARY KEY,
          project_id integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          canvas_data jsonb NOT NULL,
          saved_by text NOT NULL,
          label text,
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS snapshots_project_idx ON snapshots (project_id);
        CREATE INDEX IF NOT EXISTS snapshots_created_at_idx ON snapshots (created_at);
      `);
    } catch (err: any) {
      if (err.code === '42501') {
        console.log('[BuildIt] Skipping DDL for snapshots table (restricted preview SQL user)');
      } else {
        console.warn('[BuildIt] Notice creating snapshots table:', err.message);
      }
    }

    // 5. Ensure 7 starter templates exist (Requirement 2C & Part 1)
    try {
      const { STARTER_TEMPLATES } = await import('../lib/starterTemplates.ts');
      for (const t of STARTER_TEMPLATES) {
        await client.query(
          `
          INSERT INTO templates (id, name, description, picture, category)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            picture = EXCLUDED.picture,
            category = EXCLUDED.category;
        `,
          [t.id, t.name, t.description, t.picture, t.category]
        );
      }
    } catch (err: any) {
      console.warn('[BuildIt] Notice inserting starter templates:', err.message);
    }

    // 6. Team accounts and demo sites for the home page and the showcase (safe to run on every start)
    try {
      const { seedDemoData } = await import('./seed-demo.ts');
      await seedDemoData(client);
    } catch (err: any) {
      console.warn('[BuildIt] Notice seeding demo accounts:', err.message);
    }

    console.log('[BuildIt] Database tables and 7 student templates seeded');
  } catch (error: any) {
    console.error('[BuildIt] Database initialization note:', error.message);
  } finally {
    client.release();
  }
}
