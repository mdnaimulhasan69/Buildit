import { pgTable, text, timestamp, serial, integer, jsonb, bigint, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Users table (Requirements 18, 28.2, 35.4)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  bio: text('bio'),
  picture: text('picture'),
  socialLinks: jsonb('social_links'),
  role: text('role').notNull().default('user'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('users_user_id_idx').on(table.userId),
  uniqueIndex('users_email_idx').on(table.email),
]);

// Templates table (Requirements 1.3, 35.2)
export const templates = pgTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  picture: text('picture').notNull(),
  category: text('category').default('general'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Login attempts tracking for 5 wrong attempts in 15 minutes (Requirement 3.4 & 28.7)
export const loginAttempts = pgTable('login_attempts', {
  email: text('email').primaryKey(),
  attempts: jsonb('attempts').notNull(), // array of epoch millisecond timestamps
  lockedUntil: bigint('locked_until', { mode: 'number' }),
});

// Projects table (Requirements 5, 6, 18, 35.4)
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  teamId: integer('team_id'),
  canvasData: jsonb('canvas_data').notNull(),
  status: text('status').notNull().default('draft'),
  address: text('address'),
  visibility: text('visibility').notNull().default('private'),
  price: integer('price').default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('projects_title_idx').on(table.title),
  index('projects_owner_idx').on(table.ownerId),
]);

// Snapshots / Version History table (Requirement 2B & 9)
export const snapshots = pgTable('snapshots', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id),
  canvasData: jsonb('canvas_data').notNull(),
  savedBy: text('saved_by').notNull(),
  label: text('label'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('snapshots_project_idx').on(table.projectId),
  index('snapshots_created_at_idx').on(table.createdAt),
]);

