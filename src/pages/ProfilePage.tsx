import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useAlert } from '../components/AlertBanner.tsx';
import { fetchMyProfile, updateProfileApi } from '../lib/api-client.ts';
import { validateProfileName, validateProfileBio, validateSocialLink, validateProfilePicture } from '../lib/validation.ts';
import { User, Camera, Link as LinkIcon, Plus, Trash2, ExternalLink, ArrowLeft, Check, AlertCircle } from 'lucide-react';

interface ProfilePageProps {
  navigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user: authUser, refreshUser } = useAuth();
  const { showSuccess, showError } = useAlert();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [picture, setPicture] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<{ id: string; label: string; url: string }[]>([]);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authUser) {
      navigate('/login?redirect=/profile');
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      const res = await fetchMyProfile();
      if (res.ok && res.user) {
        setName(res.user.name || '');
        setBio(res.user.bio || '');
        setPicture(res.user.picture || null);
        setUserId(res.user.userId || '');
        setEmail(res.user.email || '');

        if (res.user.socialLinks) {
          if (Array.isArray(res.user.socialLinks)) {
            setSocialLinks(
              res.user.socialLinks.map((item: any, i: number) => ({
                id: String(i),
                label: item.label || 'Link',
                url: typeof item === 'string' ? item : item.url || ''
              }))
            );
          } else if (typeof res.user.socialLinks === 'object') {
            setSocialLinks(
              Object.entries(res.user.socialLinks).map(([k, v], i) => ({
                id: String(i),
                label: k,
                url: String(v)
              }))
            );
          }
        }
      } else {
        showError(res.error || 'Failed to load profile');
      }
      setLoading(false);
    };

    loadProfile();
  }, [authUser]);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setFieldErrors(prev => ({ ...prev, picture: '' }));
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (JPG, PNG, WebP <= 2 MB)
    const check = validateProfilePicture(file.type, file.size);
    if (!check.valid) {
      setErrorMsg(check.error || 'Use a JPG, PNG or WebP picture of up to 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPicture(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleAddSocialLink = () => {
    if (socialLinks.length >= 5) {
      setErrorMsg('You can add up to 5 social links');
      return;
    }
    setSocialLinks(prev => [
      ...prev,
      { id: String(Date.now()), label: '', url: '' }
    ]);
  };

  const handleUpdateSocialLink = (id: string, field: 'label' | 'url', value: string) => {
    setSocialLinks(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveSocialLink = (id: string) => {
    setSocialLinks(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    // Validate Name (1-50 chars)
    const nameCheck = validateProfileName(name);
    if (!nameCheck.valid) {
      setFieldErrors(prev => ({ ...prev, name: nameCheck.error || '' }));
      return;
    }

    // Validate Bio (<= 300 chars)
    const bioCheck = validateProfileBio(bio);
    if (!bioCheck.valid) {
      setFieldErrors(prev => ({ ...prev, bio: bioCheck.error || '' }));
      return;
    }

    // Validate Social Links
    for (let i = 0; i < socialLinks.length; i++) {
      const link = socialLinks[i];
      if (link.url.trim()) {
        const linkCheck = validateSocialLink(link.url);
        if (!linkCheck.valid) {
          setErrorMsg(linkCheck.error || 'Social link must start with https:// or http://');
          return;
        }
      }
    }

    // Prepare links dictionary
    const linksObj: Record<string, string> = {};
    socialLinks.forEach((item, index) => {
      if (item.url.trim()) {
        const key = item.label.trim() || `Link ${index + 1}`;
        linksObj[key] = item.url.trim();
      }
    });

    setSaving(true);
    const res = await updateProfileApi({
      name: name.trim(),
      bio: bio.trim() || null,
      picture: picture || null,
      socialLinks: linksObj
    });
    setSaving(false);

    if (res.ok) {
      showSuccess('Profile updated');
      await refreshUser();
    } else {
      if (res.field) {
        setFieldErrors(prev => ({ ...prev, [res.field!]: res.error || '' }));
      }
      setErrorMsg(res.error || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top breadcrumb & public profile shortcut */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 inline-flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Your Profile</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your personal profile, public avatar, and contact links.
          </p>
        </div>

        {userId && (
          <button
            type="button"
            onClick={() => navigate(`/u/${userId}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <span>View Public Profile</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
        {/* Profile Avatar */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Profile Picture</label>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-gray-200 shadow-inner flex items-center justify-center shrink-0">
              {picture ? (
                <img src={picture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePictureChange}
                className="hidden"
                id="profile-picture-input"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Camera className="w-4 h-4 text-gray-500" />
                  <span>Upload Picture</span>
                </button>
                {picture && (
                  <button
                    type="button"
                    onClick={() => setPicture(null)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG or WebP picture of up to 2 MB.
              </p>
            </div>
          </div>
        </div>

        {/* User ID & Email (Read-only metadata) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">User ID</label>
            <input
              type="text"
              value={`@${userId}`}
              disabled
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">User ID cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Kept private. Never shown on your public profile.</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-1">
            Display Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
            className={`w-full px-3.5 py-2.5 rounded-lg border ${
              fieldErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
            } text-gray-900 text-sm outline-none transition-all`}
            placeholder="Your name"
            required
          />
          <div className="flex justify-between items-center mt-1">
            {fieldErrors.name ? (
              <span className="text-xs text-red-600">{fieldErrors.name}</span>
            ) : (
              <span className="text-xs text-gray-500">1 to 50 characters</span>
            )}
            <span className="text-xs text-gray-400">{name.length}/50</span>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={300}
            rows={4}
            className={`w-full px-3.5 py-2.5 rounded-lg border ${
              fieldErrors.bio ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
            } text-gray-900 text-sm outline-none transition-all`}
            placeholder="Tell others a little about yourself or your projects..."
          />
          <div className="flex justify-between items-center mt-1">
            {fieldErrors.bio ? (
              <span className="text-xs text-red-600">{fieldErrors.bio}</span>
            ) : (
              <span className="text-xs text-gray-500">Up to 300 characters</span>
            )}
            <span className={`text-xs ${bio.length >= 290 ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
              {bio.length}/300
            </span>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-sm font-semibold text-gray-900">Social Links</label>
              <p className="text-xs text-gray-500">Add up to 5 links (e.g. GitHub, LinkedIn, Website)</p>
            </div>
            {socialLinks.length < 5 && (
              <button
                type="button"
                onClick={handleAddSocialLink}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Link</span>
              </button>
            )}
          </div>

          {socialLinks.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-2">No social links added yet.</p>
          ) : (
            <div className="space-y-3">
              {socialLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={link.label}
                    onChange={e => handleUpdateSocialLink(link.id, 'label', e.target.value)}
                    placeholder="Label (e.g. GitHub)"
                    className="w-1/3 px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      value={link.url}
                      onChange={e => handleUpdateSocialLink(link.id, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialLink(link.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Remove link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
