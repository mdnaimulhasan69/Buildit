import { db as pgDb } from '../db/index.ts';
import { users, templates, loginAttempts, projects, snapshots } from '../db/schema.ts';
import { eq, desc, asc, and } from 'drizzle-orm';
import { User, Template, LoginAttemptRecord } from '../types/index.ts';

class DatabaseService {
  public async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      const results = await pgDb
        .select()
        .from(users)
        .where(eq(users.email, email.trim().toLowerCase()))
        .limit(1);

      if (results.length === 0) return undefined;
      const row = results[0];
      return {
        id: String(row.id),
        userId: row.userId,
        name: row.name,
        email: row.email,
        passwordHash: row.passwordHash,
        bio: row.bio || undefined,
        picture: row.picture || undefined,
        socialLinks: (row.socialLinks as Record<string, string>) || undefined,
        role: row.role as 'user' | 'administrator',
        status: row.status as 'active' | 'suspended',
        createdAt: row.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Database query failed. Please try again later.', { cause: error });
    }
  }

  public async findUserByUserId(userId: string): Promise<User | undefined> {
    try {
      const results = await pgDb
        .select()
        .from(users)
        .where(eq(users.userId, userId.trim()))
        .limit(1);

      if (results.length === 0) return undefined;
      const row = results[0];
      return {
        id: String(row.id),
        userId: row.userId,
        name: row.name,
        email: row.email,
        passwordHash: row.passwordHash,
        bio: row.bio || undefined,
        picture: row.picture || undefined,
        socialLinks: (row.socialLinks as Record<string, string>) || undefined,
        role: row.role as 'user' | 'administrator',
        status: row.status as 'active' | 'suspended',
        createdAt: row.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error finding user by userId:', error);
      throw new Error('Database query failed. Please try again later.', { cause: error });
    }
  }

  public async findUserById(id: string): Promise<User | undefined> {
    try {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) return undefined;

      const results = await pgDb
        .select()
        .from(users)
        .where(eq(users.id, numericId))
        .limit(1);

      if (results.length === 0) return undefined;
      const row = results[0];
      return {
        id: String(row.id),
        userId: row.userId,
        name: row.name,
        email: row.email,
        passwordHash: row.passwordHash,
        bio: row.bio || undefined,
        picture: row.picture || undefined,
        socialLinks: (row.socialLinks as Record<string, string>) || undefined,
        role: row.role as 'user' | 'administrator',
        status: row.status as 'active' | 'suspended',
        createdAt: row.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw new Error('Database query failed. Please try again later.', { cause: error });
    }
  }

  public async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      const [inserted] = await pgDb
        .insert(users)
        .values({
          userId: user.userId,
          name: user.name,
          email: user.email.toLowerCase(),
          passwordHash: user.passwordHash,
          bio: user.bio,
          picture: user.picture,
          socialLinks: user.socialLinks,
          role: user.role,
          status: user.status
        })
        .returning();

      return {
        id: String(inserted.id),
        userId: inserted.userId,
        name: inserted.name,
        email: inserted.email,
        passwordHash: inserted.passwordHash,
        bio: inserted.bio || undefined,
        picture: inserted.picture || undefined,
        socialLinks: (inserted.socialLinks as Record<string, string>) || undefined,
        role: inserted.role as 'user' | 'administrator',
        status: inserted.status as 'active' | 'suspended',
        createdAt: inserted.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Database insert failed. Please try again later.', { cause: error });
    }
  }

  public async updateUserProfile(
    id: string | number,
    data: {
      name?: string;
      bio?: string | null;
      picture?: string | null;
      socialLinks?: Record<string, string> | null;
    }
  ): Promise<User | undefined> {
    try {
      const numericId = typeof id === 'number' ? id : parseInt(id, 10);
      if (isNaN(numericId)) return undefined;

      const updateValues: Record<string, any> = {};
      if (data.name !== undefined) updateValues.name = data.name;
      if (data.bio !== undefined) updateValues.bio = data.bio;
      if (data.picture !== undefined) updateValues.picture = data.picture;
      if (data.socialLinks !== undefined) updateValues.socialLinks = data.socialLinks;

      const [updated] = await pgDb
        .update(users)
        .set(updateValues)
        .where(eq(users.id, numericId))
        .returning();

      if (!updated) return undefined;

      return {
        id: String(updated.id),
        userId: updated.userId,
        name: updated.name,
        email: updated.email,
        passwordHash: updated.passwordHash,
        bio: updated.bio || undefined,
        picture: updated.picture || undefined,
        socialLinks: (updated.socialLinks as Record<string, string>) || undefined,
        role: updated.role as 'user' | 'administrator',
        status: updated.status as 'active' | 'suspended',
        createdAt: updated.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Database update failed. Please try again later.', { cause: error });
    }
  }

  public async getTemplates(): Promise<Template[]> {
    try {
      const results = await pgDb.select().from(templates);
      return results
        .filter(r => !r.category?.startsWith('snapshot:'))
        .map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          picture: r.picture,
          category: r.category || 'general',
          createdAt: r.createdAt.toISOString()
        }));
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  public async getLoginAttempts(email: string): Promise<LoginAttemptRecord | undefined> {
    try {
      const results = await pgDb
        .select()
        .from(loginAttempts)
        .where(eq(loginAttempts.email, email.trim().toLowerCase()))
        .limit(1);

      if (results.length === 0) return undefined;
      const row = results[0];
      return {
        email: row.email,
        attempts: (row.attempts as number[]) || [],
        lockedUntil: row.lockedUntil ? Number(row.lockedUntil) : undefined
      };
    } catch (error) {
      console.error('Error getting login attempts:', error);
      return undefined;
    }
  }

  public async setLoginAttempts(record: LoginAttemptRecord): Promise<void> {
    try {
      await pgDb
        .insert(loginAttempts)
        .values({
          email: record.email.toLowerCase(),
          attempts: record.attempts,
          lockedUntil: record.lockedUntil
        })
        .onConflictDoUpdate({
          target: loginAttempts.email,
          set: {
            attempts: record.attempts,
            lockedUntil: record.lockedUntil
          }
        });
    } catch (error) {
      console.error('Error setting login attempts:', error);
    }
  }

  public async clearLoginAttempts(email: string): Promise<void> {
    try {
      await pgDb
        .delete(loginAttempts)
        .where(eq(loginAttempts.email, email.trim().toLowerCase()));
    } catch (error) {
      console.error('Error clearing login attempts:', error);
    }
  }

  public async getTemplateById(id: string): Promise<Template | undefined> {
    try {
      const results = await pgDb
        .select()
        .from(templates)
        .where(eq(templates.id, id))
        .limit(1);

      if (results.length === 0) return undefined;
      const r = results[0];
      return {
        id: r.id,
        name: r.name,
        description: r.description,
        picture: r.picture,
        category: r.category || 'general',
        createdAt: r.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error getting template by id:', error);
      return undefined;
    }
  }

  public async getProjectsByOwner(ownerId: string | number): Promise<any[]> {
    try {
      const numericOwnerId = typeof ownerId === 'number' ? ownerId : parseInt(ownerId, 10);
      if (isNaN(numericOwnerId)) return [];

      const results = await pgDb
        .select()
        .from(projects)
        .where(eq(projects.ownerId, numericOwnerId))
        .orderBy(desc(projects.updatedAt));

      return results.map(p => ({
        id: String(p.id),
        title: p.title,
        ownerId: String(p.ownerId),
        teamId: p.teamId ? String(p.teamId) : undefined,
        canvasData: p.canvasData,
        status: p.status as 'draft' | 'published',
        address: p.address || undefined,
        visibility: p.visibility as 'private' | 'public',
        price: p.price ?? 0,
        updatedAt: p.updatedAt.toISOString(),
        createdAt: p.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Error getting projects by owner:', error);
      throw new Error('Database query failed. Please try again later.', { cause: error });
    }
  }

  public async getProjectById(id: string | number): Promise<any | undefined> {
    try {
      const numericId = typeof id === 'number' ? id : parseInt(id, 10);
      if (isNaN(numericId)) return undefined;

      const results = await pgDb
        .select()
        .from(projects)
        .where(eq(projects.id, numericId))
        .limit(1);

      if (results.length === 0) return undefined;
      const p = results[0];
      return {
        id: String(p.id),
        title: p.title,
        ownerId: String(p.ownerId),
        teamId: p.teamId ? String(p.teamId) : undefined,
        canvasData: p.canvasData,
        status: p.status as 'draft' | 'published',
        address: p.address || undefined,
        visibility: p.visibility as 'private' | 'public',
        price: p.price ?? 0,
        updatedAt: p.updatedAt.toISOString(),
        createdAt: p.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error getting project by id:', error);
      throw new Error('Database query failed. Please try again later.', { cause: error });
    }
  }

  public async createProject(data: {
    title: string;
    ownerId: number;
    teamId?: number;
    canvasData: any;
    status?: 'draft' | 'published';
    address?: string;
    visibility?: 'private' | 'public';
    price?: number;
  }): Promise<any> {
    try {
      const [inserted] = await pgDb
        .insert(projects)
        .values({
          title: data.title,
          ownerId: data.ownerId,
          teamId: data.teamId,
          canvasData: data.canvasData,
          status: data.status || 'draft',
          address: data.address,
          visibility: data.visibility || 'private',
          price: data.price ?? 0,
        })
        .returning();

      return {
        id: String(inserted.id),
        title: inserted.title,
        ownerId: String(inserted.ownerId),
        teamId: inserted.teamId ? String(inserted.teamId) : undefined,
        canvasData: inserted.canvasData,
        status: inserted.status as 'draft' | 'published',
        address: inserted.address || undefined,
        visibility: inserted.visibility as 'private' | 'public',
        price: inserted.price ?? 0,
        updatedAt: inserted.updatedAt.toISOString(),
        createdAt: inserted.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Database insert failed. Please try again later.', { cause: error });
    }
  }

  public async updateProjectData(id: string | number, canvasData: any): Promise<any | undefined> {
    try {
      const numericId = typeof id === 'number' ? id : parseInt(id, 10);
      if (isNaN(numericId)) return undefined;

      const [updated] = await pgDb
        .update(projects)
        .set({
          canvasData,
          updatedAt: new Date()
        })
        .where(eq(projects.id, numericId))
        .returning();

      if (!updated) return undefined;

      return {
        id: String(updated.id),
        title: updated.title,
        ownerId: String(updated.ownerId),
        teamId: updated.teamId ? String(updated.teamId) : undefined,
        canvasData: updated.canvasData,
        status: updated.status as 'draft' | 'published',
        address: updated.address || undefined,
        visibility: updated.visibility as 'private' | 'public',
        price: updated.price ?? 0,
        updatedAt: updated.updatedAt.toISOString(),
        createdAt: updated.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error updating project data:', error);
      throw new Error('Database update failed. Please try again later.', { cause: error });
    }
  }

  // --- Snapshot / Version History Methods (Requirement 2B & 9) ---

  public async createSnapshot(
    projectId: string | number,
    canvasData: any,
    savedBy: string,
    label?: string
  ): Promise<any> {
    const numericProjectId = typeof projectId === 'number' ? projectId : parseInt(projectId, 10);
    if (isNaN(numericProjectId)) throw new Error('Invalid project ID');

    try {
      const [inserted] = await pgDb
        .insert(snapshots)
        .values({
          projectId: numericProjectId,
          canvasData,
          savedBy,
          label: label || 'Saved version',
        })
        .returning();

      // Enforce max 20 snapshots per project (FIFO pruning - Requirement 9)
      const allProjectSnapshots = await pgDb
        .select({ id: snapshots.id })
        .from(snapshots)
        .where(eq(snapshots.projectId, numericProjectId))
        .orderBy(desc(snapshots.createdAt));

      if (allProjectSnapshots.length > 20) {
        const toDelete = allProjectSnapshots.slice(20);
        for (const item of toDelete) {
          await pgDb.delete(snapshots).where(eq(snapshots.id, item.id));
        }
      }

      return {
        id: String(inserted.id),
        projectId: String(inserted.projectId),
        canvasData: inserted.canvasData,
        savedBy: inserted.savedBy,
        label: inserted.label || undefined,
        createdAt: inserted.createdAt.toISOString()
      };
    } catch (error: any) {
      // Fallback: If snapshots table is restricted in preview SQL environment (code 42P01 / 42501),
      // persist atomically in PostgreSQL templates table under category `snapshot:${numericProjectId}`
      const snapshotId = `snap_${numericProjectId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date();
      await pgDb.insert(templates).values({
        id: snapshotId,
        name: savedBy,
        description: label || 'Saved version',
        picture: typeof canvasData === 'string' ? canvasData : JSON.stringify(canvasData),
        category: `snapshot:${numericProjectId}`,
        createdAt: now
      });

      // Enforce max 20 snapshots
      const allSnapshots = await pgDb
        .select({ id: templates.id })
        .from(templates)
        .where(eq(templates.category, `snapshot:${numericProjectId}`))
        .orderBy(desc(templates.createdAt));

      if (allSnapshots.length > 20) {
        const toDelete = allSnapshots.slice(20);
        for (const item of toDelete) {
          await pgDb.delete(templates).where(eq(templates.id, item.id));
        }
      }

      return {
        id: snapshotId,
        projectId: String(numericProjectId),
        canvasData,
        savedBy,
        label: label || 'Saved version',
        createdAt: now.toISOString()
      };
    }
  }

  public async getSnapshotsByProject(projectId: string | number): Promise<any[]> {
    const numericProjectId = typeof projectId === 'number' ? projectId : parseInt(projectId, 10);
    if (isNaN(numericProjectId)) return [];

    try {
      const results = await pgDb
        .select({
          id: snapshots.id,
          projectId: snapshots.projectId,
          savedBy: snapshots.savedBy,
          label: snapshots.label,
          createdAt: snapshots.createdAt
        })
        .from(snapshots)
        .where(eq(snapshots.projectId, numericProjectId))
        .orderBy(desc(snapshots.createdAt))
        .limit(20);

      return results.map(s => ({
        id: String(s.id),
        projectId: String(s.projectId),
        savedBy: s.savedBy,
        label: s.label || undefined,
        createdAt: s.createdAt.toISOString()
      }));
    } catch (error) {
      // Fallback: query PostgreSQL templates table with category `snapshot:${numericProjectId}`
      try {
        const results = await pgDb
          .select()
          .from(templates)
          .where(eq(templates.category, `snapshot:${numericProjectId}`))
          .orderBy(desc(templates.createdAt))
          .limit(20);

        return results.map(t => ({
          id: t.id,
          projectId: String(numericProjectId),
          savedBy: t.name,
          label: t.description || undefined,
          createdAt: t.createdAt.toISOString()
        }));
      } catch (err) {
        console.error('Error fetching snapshots fallback:', err);
        return [];
      }
    }
  }

  public async getSnapshotById(snapshotId: string | number): Promise<any | undefined> {
    try {
      const numericId = typeof snapshotId === 'number' ? snapshotId : parseInt(snapshotId, 10);
      if (!isNaN(numericId)) {
        const [row] = await pgDb
          .select()
          .from(snapshots)
          .where(eq(snapshots.id, numericId))
          .limit(1);

        if (row) {
          return {
            id: String(row.id),
            projectId: String(row.projectId),
            canvasData: row.canvasData,
            savedBy: row.savedBy,
            label: row.label || undefined,
            createdAt: row.createdAt.toISOString()
          };
        }
      }
    } catch {}

    // Fallback: Check in PostgreSQL templates table
    try {
      const strId = String(snapshotId);
      const [row] = await pgDb
        .select()
        .from(templates)
        .where(eq(templates.id, strId))
        .limit(1);

      if (!row) return undefined;

      const projectId = row.category?.replace('snapshot:', '') || '';
      let canvasData: any = {};
      try {
        canvasData = JSON.parse(row.picture);
      } catch {
        canvasData = row.picture;
      }

      return {
        id: row.id,
        projectId,
        canvasData,
        savedBy: row.name,
        label: row.description || undefined,
        createdAt: row.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error fetching snapshot by id:', error);
      return undefined;
    }
  }

  public async restoreSnapshot(
    projectId: string | number,
    snapshotId: string | number,
    restoredBy: string
  ): Promise<any | undefined> {
    try {
      const numericProjectId = typeof projectId === 'number' ? projectId : parseInt(projectId, 10);

      const targetSnapshot = await this.getSnapshotById(snapshotId);
      if (!targetSnapshot || String(targetSnapshot.projectId) !== String(numericProjectId)) {
        return undefined;
      }

      // Fetch current project to backup current state before restoring
      const currentProject = await this.getProjectById(numericProjectId);
      if (currentProject) {
        await this.createSnapshot(
          numericProjectId,
          currentProject.canvasData,
          restoredBy,
          'Before restore (auto-backup)'
        );
      }

      // Update project canvasData to targetSnapshot.canvasData
      return await this.updateProjectData(numericProjectId, targetSnapshot.canvasData);
    } catch (error) {
      console.error('Error restoring snapshot:', error);
      throw new Error('Failed to restore snapshot', { cause: error });
    }
  }
}

export const db = new DatabaseService();

