import { UserPublicProfile, Template } from '../types/index.ts';

const TOKEN_KEY = 'buildit_auth_token';
const USER_KEY = 'buildit_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): UserPublicProfile | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: UserPublicProfile) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: string; field?: string; status?: number; expired?: boolean }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (!res.ok) {
      // Check 401 token expired
      if (res.status === 401 && json?.expired) {
        clearStoredAuth();
        return {
          ok: false,
          status: 401,
          expired: true,
          error: 'Your login has expired. Please log in again.'
        };
      }

      return {
        ok: false,
        status: res.status,
        error: json?.error || 'Action failed. Please try again.',
        field: json?.field
      };
    }

    return { ok: true, data: json, status: res.status };
  } catch (err: any) {
    // Network / connection error -> Requirement 26.5 exact message
    return {
      ok: false,
      error: 'Cannot reach the server. Check your connection and try again.'
    };
  }
}

export async function fetchTemplates(): Promise<Template[]> {
  const res = await apiFetch<{ success: boolean; templates: Template[] }>('/api/templates');
  if (res.ok && res.data?.templates) {
    return res.data.templates;
  }
  return [];
}

export async function fetchProjects(): Promise<{ ok: boolean; projects?: any[]; error?: string }> {
  const res = await apiFetch<{ success: boolean; projects: any[] }>('/api/projects');
  if (res.ok && res.data?.projects) {
    return { ok: true, projects: res.data.projects };
  }
  return { ok: false, error: res.error || 'Failed to load projects' };
}

export async function fetchProjectById(id: string): Promise<{ ok: boolean; project?: any; error?: string; status?: number }> {
  const res = await apiFetch<{ success: boolean; project: any }>(`/api/projects/${id}`);
  if (res.ok && res.data?.project) {
    return { ok: true, project: res.data.project, status: res.status };
  }
  return { ok: false, error: res.error, status: res.status };
}

export async function createProjectApi(data: {
  title: string;
  templateId?: string;
}): Promise<{ ok: boolean; project?: any; error?: string; field?: string }> {
  const res = await apiFetch<{ success: boolean; project: any }>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (res.ok && res.data?.project) {
    return { ok: true, project: res.data.project };
  }
  return { ok: false, error: res.error, field: res.field };
}

export async function saveProjectApi(
  id: string,
  canvasData: any,
  isAutosave: boolean = false
): Promise<{ ok: boolean; message?: string; error?: string; status?: number; expired?: boolean; updatedAt?: string }> {
  const res = await apiFetch<{ success: boolean; message: string; updatedAt: string }>(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ canvasData, isAutosave })
  });

  if (res.ok) {
    return {
      ok: true,
      message: res.data?.message || 'saved',
      updatedAt: res.data?.updatedAt,
      status: res.status
    };
  }

  return {
    ok: false,
    error: res.error,
    status: res.status,
    expired: res.expired
  };
}

export async function fetchSnapshots(projectId: string): Promise<{ ok: boolean; snapshots?: any[]; error?: string }> {
  const res = await apiFetch<{ success: boolean; snapshots: any[] }>(`/api/projects/${projectId}/snapshots`);
  if (res.ok && res.data?.snapshots) {
    return { ok: true, snapshots: res.data.snapshots };
  }
  return { ok: false, error: res.error || 'Failed to fetch version history' };
}

export async function fetchSnapshotById(projectId: string, snapshotId: string): Promise<{ ok: boolean; snapshot?: any; error?: string }> {
  const res = await apiFetch<{ success: boolean; snapshot: any }>(`/api/projects/${projectId}/snapshots/${snapshotId}`);
  if (res.ok && res.data?.snapshot) {
    return { ok: true, snapshot: res.data.snapshot };
  }
  return { ok: false, error: res.error || 'Failed to fetch snapshot' };
}

export async function restoreSnapshotApi(projectId: string, snapshotId: string): Promise<{ ok: boolean; project?: any; error?: string }> {
  const res = await apiFetch<{ success: boolean; message: string; project: any }>(`/api/projects/${projectId}/snapshots/${snapshotId}/restore`, {
    method: 'POST'
  });
  if (res.ok && res.data?.project) {
    return { ok: true, project: res.data.project };
  }
  return { ok: false, error: res.error || 'Failed to restore version' };
}


export async function fetchMyProfile(): Promise<{ ok: boolean; user?: any; error?: string; status?: number }> {
  const res = await apiFetch<{ success: boolean; user: any }>('/api/users/me/profile');
  if (res.ok && res.data?.user) {
    return { ok: true, user: res.data.user };
  }
  return { ok: false, error: res.error, status: res.status };
}

export async function fetchPublicProfile(userIdOrId: string): Promise<{ ok: boolean; user?: any; projects?: any[]; error?: string; status?: number }> {
  const res = await apiFetch<{ success: boolean; user: any; projects: any[] }>(`/api/users/profile/${encodeURIComponent(userIdOrId)}`);
  if (res.ok && res.data?.user) {
    return { ok: true, user: res.data.user, projects: res.data.projects || [] };
  }
  return { ok: false, error: res.error, status: res.status };
}

export async function updateProfileApi(data: {
  name?: string;
  bio?: string | null;
  picture?: string | null;
  socialLinks?: Record<string, string> | null;
}): Promise<{ ok: boolean; message?: string; user?: any; error?: string; field?: string }> {
  const res = await apiFetch<{ success: boolean; message: string; user: any }>('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  if (res.ok) {
    if (res.data?.user) {
      const stored = getStoredUser();
      if (stored) {
        setStoredAuth(getStoredToken() || '', {
          ...stored,
          name: res.data.user.name,
          bio: res.data.user.bio,
          picture: res.data.user.picture,
          socialLinks: res.data.user.socialLinks
        });
      }
    }
    return { ok: true, message: res.data?.message || 'Profile updated', user: res.data?.user };
  }
  return { ok: false, error: res.error, field: res.field };
}

export async function fetchGoogleAuthConfig(): Promise<{ configured: boolean; clientId: string | null }> {
  try {
    const res = await apiFetch<{ configured: boolean; clientId: string | null }>('/api/auth/google/config');
    if (res.ok && res.data) {
      return res.data;
    }
    return { configured: false, clientId: null };
  } catch {
    return { configured: false, clientId: null };
  }
}

export async function signInWithGoogleApi(credential: string, desiredUserId?: string): Promise<{
  ok: boolean;
  token?: string;
  user?: any;
  error?: string;
  isNewUser?: boolean;
}> {
  const res = await apiFetch<{ success: boolean; token: string; user: any; isNewUser?: boolean }>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential, desiredUserId })
  });

  if (res.ok && res.data?.token) {
    setStoredAuth(res.data.token, res.data.user);
    return { ok: true, token: res.data.token, user: res.data.user, isNewUser: res.data.isNewUser };
  }

  return { ok: false, error: res.error || 'Google sign-in failed' };
}




