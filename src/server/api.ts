import express from 'express';
import crypto from 'node:crypto';
import { db } from './db.ts';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  checkLockout,
  recordFailedAttempt,
  verifyGoogleIdToken
} from './auth-logic.ts';
import {
  validateUserId,
  validateEmail,
  validatePassword,
  validateRequired,
  validateProjectTitle,
  validateProfileName,
  validateProfileBio,
  validateSocialLink,
  validateProfilePicture,
  sanitizeText
} from '../lib/validation.ts';
import {
  validateAndCleanProjectData,
  canUserSaveProject
} from './sanitizer.ts';
import { User } from '../types/index.ts';

export const apiRouter = express.Router();

export const expressApp = express();

// Dedicated parsers mounted before default 100KB:
// 6MB for project save, 3MB for profile pictures (up to 2MB image), 100KB for all other routes
const saveBodyParser = express.json({ limit: '6mb' });
const profileBodyParser = express.json({ limit: '3mb' });
const defaultBodyParser = express.json({ limit: '100kb' });

expressApp.use((req, res, next) => {
  const url = req.originalUrl || req.url || '';
  const isSaveRoute =
    (req.method === 'PUT' && url.includes('/api/projects/')) ||
    (req.method === 'POST' && url.includes('/projects/') && url.includes('/save'));
  const isProfileRoute =
    (req.method === 'PUT' && url.includes('/api/users/profile'));

  let parser = defaultBodyParser;
  if (isSaveRoute) parser = saveBodyParser;
  else if (isProfileRoute) parser = profileBodyParser;

  parser(req, res, (err: any) => {
    if (err) {
      if (err.type === 'entity.too.large' || err.status === 413) {
        if (isSaveRoute) {
          return res.status(400).json({ error: 'This project is too large to save. Remove some images or elements.' });
        }
        if (isProfileRoute) {
          return res.status(400).json({ error: 'Use a JPG, PNG or WebP picture of up to 2 MB.' });
        }
        return res.status(413).json({ error: 'Payload too large' });
      }
      return res.status(400).json({ error: 'Invalid JSON request' });
    }
    next();
  });
});

expressApp.use('/api', apiRouter);

import { registerPublishedRoutes } from './showcase.ts';
// Public pages at /p/<address> (the demo sites of the showcase)
registerPublishedRoutes(expressApp);

import { pool } from '../db/index.ts';

// Server health check (Requirement 4)
apiRouter.get('/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT count(*)::int as count FROM templates');
    const templatesCount = Number(result.rows[0]?.count ?? 0);
    return res.json({
      status: 'ok',
      database: 'ok',
      templates: templatesCount
    });
  } catch (error: any) {
    console.error('[BuildIt Health Check] Database check error:', error.message);
    let sanitizedReason = 'Database connection failed';
    if (error.code === 'ECONNREFUSED') sanitizedReason = 'Database connection refused';
    else if (error.code === '28P01') sanitizedReason = 'Database authentication failed';
    else if (error.code === '3D000') sanitizedReason = 'Database not found';
    return res.status(500).json({
      status: 'error',
      database: 'error',
      reason: sanitizedReason
    });
  }
});

// Templates list (Requirement 1.3, 2C, 35.2)
apiRouter.get('/templates', async (_req, res) => {
  try {
    const dbTemplates = await db.getTemplates();
    const { STARTER_TEMPLATES } = await import('../lib/starterTemplates.ts');
    const combined = STARTER_TEMPLATES.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      picture: t.picture,
      category: t.category,
      createdAt: new Date().toISOString()
    }));
    for (const d of dbTemplates) {
      if (!combined.some(c => c.id === d.id)) {
        combined.push(d);
      }
    }
    res.json({ success: true, templates: combined });
  } catch (err: any) {
    console.error('Error fetching templates:', err);
    res.json({ success: true, templates: [] });
  }
});

// Register
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { name, userId, email, password } = req.body;

    // Check empty required fields
    const nameCheck = validateRequired(name);
    if (!nameCheck.valid) {
      return res.status(400).json({ error: 'This field is required', field: 'name' });
    }

    const userIdCheck = validateUserId(userId);
    if (!userIdCheck.valid) {
      return res.status(400).json({ error: userIdCheck.error, field: 'userId' });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.error, field: 'email' });
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return res.status(400).json({ error: passCheck.error, field: 'password' });
    }

    // Check user ID uniqueness (Requirement: "This user ID is taken")
    const existingUserById = await db.findUserByUserId(userId);
    if (existingUserById) {
      return res.status(400).json({ error: 'This user ID is taken', field: 'userId' });
    }

    // Check email uniqueness (Requirement: "An account with this email already exists. Log in instead.")
    const existingUserByEmail = await db.findUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ error: 'An account with this email already exists. Log in instead.', field: 'email' });
    }

    // Hash password with bcrypt (Requirement 28.2)
    const passwordHash = await hashPassword(password);

    // Sanitize user inputs (Requirement 28.5)
    const newUser = await db.createUser({
      userId: sanitizeText(userId).trim(),
      name: sanitizeText(name).trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    });

    // Generate 7-day JWT (Requirement 3.5 & 35.3)
    const token = generateToken({
      id: newUser.id,
      userId: newUser.userId,
      role: newUser.role,
      email: newUser.email
    });

    const publicUser = {
      id: newUser.id,
      userId: newUser.userId,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: publicUser
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailCheck = validateRequired(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: 'This field is required', field: 'email' });
    }

    const passCheck = validateRequired(password);
    if (!passCheck.valid) {
      return res.status(400).json({ error: 'This field is required', field: 'password' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check lockout: 5 wrong passwords in 15 minutes per account (Requirement 3.4 & 28.7)
    const attemptRecord = await db.getLoginAttempts(normalizedEmail);
    const lockoutStatus = checkLockout(attemptRecord);
    if (lockoutStatus.locked) {
      return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes' });
    }

    const user = await db.findUserByEmail(normalizedEmail);
    if (!user) {
      // Record failed attempt against this email
      const { record, locked } = recordFailedAttempt(attemptRecord, normalizedEmail);
      await db.setLoginAttempts(record);
      if (locked) {
        return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes' });
      }
      // Exact message: "Email or password is incorrect"
      return res.status(401).json({ error: 'Email or password is incorrect' });
    }

    // Verify password with bcrypt
    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      const { record, locked } = recordFailedAttempt(attemptRecord, normalizedEmail);
      await db.setLoginAttempts(record);
      if (locked) {
        return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes' });
      }
      return res.status(401).json({ error: 'Email or password is incorrect' });
    }

    // Login succeeded: reset failed attempts
    await db.clearLoginAttempts(normalizedEmail);

    // Generate 7-day token
    const token = generateToken({
      id: user.id,
      userId: user.userId,
      role: user.role,
      email: user.email
    });

    const publicUser = {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };

    return res.json({
      success: true,
      token,
      user: publicUser
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/google/config - Google Client ID configuration check (Part 2D)
apiRouter.get('/auth/google/config', (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  return res.json({
    configured: Boolean(clientId),
    clientId: clientId || null
  });
});

// POST /api/auth/google - Authenticate with Google ID token (Part 2D)
apiRouter.post('/auth/google', async (req, res) => {
  try {
    const { credential, desiredUserId } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    const verification = await verifyGoogleIdToken(credential);
    if (!verification.valid || !verification.payload) {
      return res.status(400).json({ error: verification.error || 'Failed to verify Google token' });
    }

    const { email, name, picture } = verification.payload;

    // Check if user already exists with this email
    let user = await db.findUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      // Create new user account for first-time Google sign-in
      isNewUser = true;

      // Generate a valid, unique username (3-20 chars, lowercase, letters, numbers, _)
      let baseUserId = (desiredUserId || email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .substring(0, 15);
      if (baseUserId.length < 3) baseUserId = `user_${baseUserId}`;

      let candidateUserId = baseUserId;
      let counter = 1;
      while (await db.findUserByUserId(candidateUserId)) {
        candidateUserId = `${baseUserId}_${counter++}`.substring(0, 20);
      }

      // Generate random strong password hash
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await hashPassword(randomPassword);

      user = await db.createUser({
        userId: candidateUserId,
        name: sanitizeText(name).trim() || candidateUserId,
        email: email.toLowerCase(),
        passwordHash,
        picture: picture || undefined,
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }

    // Generate standard 7-day token
    const token = generateToken({
      id: user.id,
      userId: user.userId,
      role: user.role,
      email: user.email
    });

    const publicUser = {
      id: user.id,
      userId: user.userId,
      name: user.name,
      picture: user.picture,
      role: user.role,
      createdAt: user.createdAt
    };

    return res.json({
      success: true,
      token,
      user: publicUser,
      isNewUser
    });
  } catch (err: any) {
    console.error('Google sign-in error:', err);
    return res.status(500).json({ error: 'Google sign-in failed. Please try again.' });
  }
});

// Current user profile
apiRouter.get('/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const verified = verifyToken(token);

  if (!verified.valid) {
    if (verified.expired) {
      // Exact message: "Your login has expired. Please log in again."
      return res.status(401).json({ error: 'Your login has expired. Please log in again.', expired: true });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = await db.findUserById(verified.payload.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    user: {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// Helper auth middleware for protected endpoints (Requirement 28.3, 28.4)
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const verified = verifyToken(token);

  if (!verified.valid) {
    if (verified.expired) {
      return res.status(401).json({ error: 'Your login has expired. Please log in again.', expired: true });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = await db.findUserById(verified.payload.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  (req as any).user = user;
  next();
};

// GET /api/projects - List user's projects (Requirement 5.1, 5.2, 29.3)
apiRouter.get('/projects', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const userProjects = await db.getProjectsByOwner(user.id);
    return res.json({ success: true, projects: userProjects });
  } catch (err: any) {
    console.error('Error listing projects:', err);
    return res.status(500).json({ error: 'Failed to load projects. Please try again.' });
  }
});

// GET /api/projects/:id - Open project in editor (Requirement 6.4, 29.1, 29.3)
apiRouter.get('/projects/:id', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const project = await db.getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Access control check (Requirement 28.4 & 29.1): private project opened only by owner
    if (project.ownerId !== String(user.id)) {
      return res.status(403).json({ error: 'You do not have permission to do this' });
    }

    return res.json({ success: true, project });
  } catch (err: any) {
    console.error('Error fetching project:', err);
    return res.status(500).json({ error: 'Failed to open project. Please try again.' });
  }
});

// POST /api/projects - Create a project (Requirement 6.1, 6.2, 6.3, 6.5, 30.5)
apiRouter.post('/projects', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const { title, templateId } = req.body;

    // Validate title (Requirement 6.2: required and up to 80 characters)
    const titleCheck = validateProjectTitle(title);
    if (!titleCheck.valid) {
      return res.status(400).json({ error: titleCheck.error, field: 'title' });
    }

    let canvasData: any = {
      pages: [
        {
          id: 'page-1',
          name: 'Home',
          frames: [],
          components: []
        }
      ],
      styles: [],
      assets: []
    };

    // If template chosen, copy template data (Requirement 2C, 6.3 & Clone)
    if (templateId) {
      const { STARTER_TEMPLATES } = await import('../lib/starterTemplates.ts');
      const foundStarter = STARTER_TEMPLATES.find(t => t.id === templateId);
      if (foundStarter) {
        canvasData = {
          templateId: foundStarter.id,
          templateName: foundStarter.name,
          html: foundStarter.html,
          css: foundStarter.css
        };
      } else {
        const template = await db.getTemplateById(templateId);
        if (template) {
          canvasData = {
            templateId: template.id,
            templateName: template.name,
            html: `<h1>${template.name}</h1><p>${template.description}</p>`,
            css: ''
          };
        }
      }
    }

    // Atomic insert of new project (Requirement 30.5 & 6.5)
    const newProject = await db.createProject({
      title: sanitizeText(title).trim(),
      ownerId: Number(user.id),
      canvasData,
      status: 'draft',
      visibility: 'private'
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: newProject
    });
  } catch (err: any) {
    console.error('Error creating project:', err);
    return res.status(500).json({ error: 'Failed to create project. Please try again.' });
  }
});

// PUT /api/projects/:id or POST /api/projects/:id/save - Save project (Requirement 8, 28.4, 28.5, 30.5)
const handleProjectSave = async (req: express.Request, res: express.Response) => {
  try {
    const user = (req as any).user;
    const projectId = req.params.id;

    // 1. Fetch project from database (Requirement 8.7 & 29.1)
    const project = await db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 2. Permission check (Requirement 8.7 & 28.4)
    // Only owner, team host, and editors can save. Viewer cannot.
    if (!canUserSaveProject(user.id, project)) {
      return res.status(403).json({ error: 'You do not have permission to do this' });
    }

    // 3. Payload size and sanitization check (Requirement 8.5 & 28.5)
    const rawData = req.body && req.body.canvasData !== undefined ? req.body.canvasData : req.body;
    const sanitizeResult = validateAndCleanProjectData(rawData);
    if (!sanitizeResult.valid) {
      return res.status(400).json({ error: sanitizeResult.error });
    }

    // 4. Save project to database atomically (Requirement 30.5 & 8.6)
    const updated = await db.updateProjectData(project.id, sanitizeResult.data);
    if (!updated) {
      return res.status(500).json({ error: 'Could not save. Your changes are still here.' });
    }

    // 5. Create version snapshot on manual save (Requirement 2B & Step 6: In Part 2B a click on "Save" will also add a snapshot. An automatic save adds no snapshot)
    if (!req.body?.isAutosave) {
      try {
        await db.createSnapshot(
          project.id,
          sanitizeResult.data,
          user.name || user.userId || 'User',
          req.body?.snapshotLabel || 'Saved version'
        );
      } catch (snapErr) {
        console.warn('Notice creating snapshot on save:', snapErr);
      }
    }

    // 6. Answer saved (Requirement 8.3 & step 7)
    return res.json({
      success: true,
      message: 'saved',
      updatedAt: updated.updatedAt,
      project: updated
    });
  } catch (err: any) {
    console.error('Error saving project:', err);
    return res.status(500).json({ error: 'Could not save. Your changes are still here.' });
  }
};

apiRouter.put('/projects/:id', authenticateUser, handleProjectSave);
apiRouter.post('/projects/:id/save', authenticateUser, handleProjectSave);

// --- Version History / Snapshots Endpoints (Part 2B) ---

// GET /api/projects/:id/snapshots - List snapshots
apiRouter.get('/projects/:id/snapshots', authenticateUser, async (req: express.Request, res: express.Response) => {
  try {
    const user = (req as any).user;
    const projectId = req.params.id;

    const project = await db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Permission check: owner or collaborator
    if (String(project.ownerId) !== String(user.id) && project.visibility === 'private') {
      return res.status(403).json({ error: 'You do not have permission to do this' });
    }

    const snapshotsList = await db.getSnapshotsByProject(projectId);
    return res.json({ success: true, snapshots: snapshotsList });
  } catch (err: any) {
    console.error('Error listing snapshots:', err);
    return res.status(500).json({ error: 'Failed to fetch version history' });
  }
});

// GET /api/projects/:id/snapshots/:snapshotId - Get single snapshot with canvas data (for preview)
apiRouter.get('/projects/:id/snapshots/:snapshotId', authenticateUser, async (req: express.Request, res: express.Response) => {
  try {
    const user = (req as any).user;
    const { id: projectId, snapshotId } = req.params;

    const project = await db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (String(project.ownerId) !== String(user.id) && project.visibility === 'private') {
      return res.status(403).json({ error: 'You do not have permission to do this' });
    }

    const snapshot = await db.getSnapshotById(snapshotId);
    if (!snapshot || String(snapshot.projectId) !== String(projectId)) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    return res.json({ success: true, snapshot });
  } catch (err: any) {
    console.error('Error fetching snapshot:', err);
    return res.status(500).json({ error: 'Failed to fetch snapshot' });
  }
});

// POST /api/projects/:id/snapshots/:snapshotId/restore - Restore a snapshot
apiRouter.post('/projects/:id/snapshots/:snapshotId/restore', authenticateUser, async (req: express.Request, res: express.Response) => {
  try {
    const user = (req as any).user;
    const { id: projectId, snapshotId } = req.params;

    const project = await db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only owner, team host, and editors can save/restore (Requirement 8.7 & 28.4)
    if (!canUserSaveProject(user.id, project)) {
      return res.status(403).json({ error: 'You do not have permission to do this' });
    }

    const restoredProject = await db.restoreSnapshot(
      projectId,
      snapshotId,
      user.name || user.userId || 'User'
    );

    if (!restoredProject) {
      return res.status(400).json({ error: 'Could not restore snapshot' });
    }

    return res.json({
      success: true,
      message: 'Version restored successfully',
      project: restoredProject
    });
  } catch (err: any) {
    console.error('Error restoring snapshot:', err);
    return res.status(500).json({ error: 'Failed to restore snapshot' });
  }
});


// --- User Profile Endpoints (Part 2A) ---

// GET /api/users/me/profile - Current user profile
apiRouter.get('/users/me/profile', authenticateUser, async (req: express.Request, res: express.Response) => {
  try {
    const authUser = (req as any).user;
    const user = await db.findUserById(authUser.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        bio: user.bio,
        picture: user.picture,
        socialLinks: user.socialLinks,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/users/profile/:userIdOrId - Public user profile (Requirement 29.2: Strip email and password)
apiRouter.get('/users/profile/:userIdOrId', async (req: express.Request, res: express.Response) => {
  try {
    const param = req.params.userIdOrId;
    let user = await db.findUserByUserId(param);
    if (!user) {
      user = await db.findUserById(param);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Public projects of this user
    const allProjects = await db.getProjectsByOwner(user.id);
    const publicProjects = allProjects.filter(p => p.visibility === 'public' || p.status === 'published');

    // Return profile WITHOUT email or passwordHash (Privacy Requirement 29.2)
    return res.json({
      success: true,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        bio: user.bio,
        picture: user.picture,
        socialLinks: user.socialLinks,
        role: user.role,
        createdAt: user.createdAt
      },
      projects: publicProjects.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        address: p.address,
        updatedAt: p.updatedAt
      }))
    });
  } catch (err: any) {
    console.error('Error fetching public profile:', err);
    return res.status(500).json({ error: 'Failed to fetch public profile' });
  }
});

// PUT /api/users/profile - Update user profile (Requirement 2A)
apiRouter.put('/users/profile', authenticateUser, async (req: express.Request, res: express.Response) => {
  try {
    const authUser = (req as any).user;
    const { name, bio, picture, socialLinks } = req.body;

    // Validate Name (1-50 chars)
    if (name !== undefined) {
      const nameCheck = validateProfileName(name);
      if (!nameCheck.valid) {
        return res.status(400).json({ error: nameCheck.error, field: 'name' });
      }
    }

    // Validate Bio (max 300 chars)
    if (bio !== undefined && bio !== null && bio !== '') {
      const bioCheck = validateProfileBio(bio);
      if (!bioCheck.valid) {
        return res.status(400).json({ error: bioCheck.error, field: 'bio' });
      }
    }

    // Validate Social Links (up to 5 links, each starts with http:// or https://)
    if (socialLinks !== undefined && socialLinks !== null) {
      if (typeof socialLinks !== 'object') {
        return res.status(400).json({ error: 'Social links must be an object or array' });
      }
      const linksArray = Array.isArray(socialLinks)
        ? socialLinks
        : Object.entries(socialLinks).map(([k, v]) => ({ label: k, url: v as string }));

      if (linksArray.length > 5) {
        return res.status(400).json({ error: 'You can add up to 5 social links' });
      }

      for (const link of linksArray) {
        const urlToCheck = typeof link === 'string' ? link : link.url;
        if (urlToCheck) {
          const linkCheck = validateSocialLink(urlToCheck);
          if (!linkCheck.valid) {
            return res.status(400).json({ error: linkCheck.error });
          }
        }
      }
    }

    // Validate Picture (JPG, PNG, WebP up to 2MB)
    if (picture !== undefined && picture !== null && picture !== '') {
      if (typeof picture === 'string' && picture.startsWith('data:')) {
        const mimeMatch = picture.match(/^data:([a-zA-Z0-9.+/-]+);base64,/);
        if (!mimeMatch) {
          return res.status(400).json({ error: 'Use a JPG, PNG or WebP picture of up to 2 MB.' });
        }
        const mimeType = mimeMatch[1];
        const base64Data = picture.substring(mimeMatch[0].length);
        const sizeBytes = Math.ceil((base64Data.length * 3) / 4);

        const picCheck = validateProfilePicture(mimeType, sizeBytes);
        if (!picCheck.valid) {
          return res.status(400).json({ error: picCheck.error });
        }
      } else if (typeof picture === 'string' && !picture.startsWith('http')) {
        return res.status(400).json({ error: 'Use a JPG, PNG or WebP picture of up to 2 MB.' });
      }
    }

    const updatedUser = await db.updateUserProfile(authUser.id, {
      name: name !== undefined ? sanitizeText(name).trim() : undefined,
      bio: bio !== undefined ? (bio ? sanitizeText(bio).trim() : null) : undefined,
      picture: picture !== undefined ? (picture || null) : undefined,
      socialLinks: socialLinks !== undefined ? socialLinks : undefined
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return exact message: "Profile updated"
    return res.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: updatedUser.id,
        userId: updatedUser.userId,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        picture: updatedUser.picture,
        socialLinks: updatedUser.socialLinks,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (err: any) {
    console.error('Error updating user profile:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});


