import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { fetchProjects } from '../lib/api-client.ts';
import { Project } from '../types/index.ts';
import { NewProjectModal } from '../components/NewProjectModal.tsx';
import { Plus, Search, Folder, Users, Calendar, ArrowRight, Layout } from 'lucide-react';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/dashboard');
      return;
    }

    async function loadProjects() {
      if (!user) return;
      setLoading(true);
      const res = await fetchProjects();
      if (res.ok && res.projects) {
        setProjects(res.projects);
      }
      setLoading(false);
    }

    if (user) {
      loadProjects();
    }
  }, [user, authLoading, navigate]);

  // Filter projects by title ignoring upper/lower case (Requirement 5.3)
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter((p) => p.title.toLowerCase().includes(q));
  }, [projects, searchQuery]);

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    // Requirement 6.4: The editor opens on the new project as soon as it is created
    navigate(`/editor/${newProject.id}`);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-gray-500 text-sm">
        Starting up, please wait
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome back, <span className="font-semibold text-gray-900">{user.name}</span>. Manage your pages and forms.
            </p>
          </div>

          {/* Requirement 5.1 & 6.1: "New project" button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New project</span>
          </button>
        </div>

        {/* Controls Bar: Tabs and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-3 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Tabs: "My projects" and "Team projects" (Requirement 5.1) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === 'my'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My projects ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === 'team'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Team projects
            </button>
          </div>

          {/* Search Box: filters by title, case insensitive (Requirement 5.3) */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Tab Content: Team projects (Requirement 5.4: empty) */}
        {activeTab === 'team' && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              You are not in any team yet.
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('my')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              View My projects
            </button>
          </div>
        )}

        {/* Tab Content: My projects */}
        {activeTab === 'my' && (
          <>
            {loading ? (
              <div className="py-16 text-center text-gray-500 text-sm">
                Starting up, please wait
              </div>
            ) : projects.length === 0 ? (
              // Requirement 5.5: A user with no projects sees a short message that points to “New project” and “Browse templates”.
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm max-w-xl mx-auto my-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Folder className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  You do not have any projects yet. Click <span className="font-semibold text-gray-900">“New project”</span> to start building with a blank canvas or copy a ready-made design, or <span className="font-semibold text-gray-900">“Browse templates”</span> to explore starters.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New project</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <Layout className="w-4 h-4" />
                    <span>Browse templates</span>
                  </button>
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                <p className="text-sm text-gray-500">
                  No projects match your search &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-sm font-medium text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              // Requirement 5.2: Each project is shown as a card with its title, the date of its last change and its status (draft or published).
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => navigate(`/editor/${proj.id}`)}
                    className="group cursor-pointer bg-white rounded-xl border border-gray-200 hover:border-blue-400 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top badge and icon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Folder className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            proj.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>

                      {/* Project Title (Requirement 5.2) */}
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                        {proj.title}
                      </h3>
                    </div>

                    {/* Footer: Date of last change & Open in editor link */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1.5" title="Date of last change">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDate(proj.updatedAt)}</span>
                      </div>
                      <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Open editor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* New Project Dialog */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};
