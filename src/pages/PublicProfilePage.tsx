import React, { useState, useEffect } from 'react';
import { fetchPublicProfile } from '../lib/api-client.ts';
import { User, Link as LinkIcon, ExternalLink, Globe, Calendar, ArrowLeft, FolderGit2 } from 'lucide-react';

interface PublicProfilePageProps {
  userId: string;
  navigate: (path: string) => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ userId, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetchPublicProfile(userId);
      if (res.ok && res.user) {
        setUserProfile(res.user);
        setProjects(res.projects || []);
      } else {
        setErrorMsg(res.error || 'User not found');
      }
      setLoading(false);
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMsg || !userProfile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
        <p className="text-gray-600 mb-6">{errorMsg || 'The requested user profile does not exist.'}</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Parse social links if present
  let linksList: { label: string; url: string }[] = [];
  if (userProfile.socialLinks) {
    if (Array.isArray(userProfile.socialLinks)) {
      linksList = userProfile.socialLinks;
    } else if (typeof userProfile.socialLinks === 'object') {
      linksList = Object.entries(userProfile.socialLinks).map(([k, v]) => ({
        label: k,
        url: String(v)
      }));
    }
  }

  const formattedDate = userProfile.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="text-sm font-medium text-gray-500 hover:text-gray-900 inline-flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-gray-200 shadow-inner flex items-center justify-center shrink-0">
            {userProfile.picture ? (
              <img
                src={userProfile.picture}
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 truncate">
                {userProfile.name}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                @{userProfile.userId}
              </span>
            </div>

            {userProfile.bio && (
              <p className="mt-3 text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed max-w-2xl">
                {userProfile.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
              {formattedDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Joined {formattedDate}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-gray-400" />
                <span>{projects.length} public project{projects.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links Bar */}
        {linksList.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">
              Links:
            </span>
            {linksList.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                <span>{link.label || 'Website'}</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Public Projects Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-blue-600" />
          <span>Public Projects</span>
        </h2>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            <p className="text-sm">No public projects published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map(proj => (
              <div
                key={proj.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">{proj.title}</h3>
                  {proj.address && (
                    <span className="text-xs text-blue-600 font-mono">
                      /p/{proj.address}
                    </span>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Updated {new Date(proj.updatedAt).toLocaleDateString()}</span>
                  {proj.address && (
                    <a
                      href={`/p/${proj.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
