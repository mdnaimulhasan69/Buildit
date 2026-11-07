import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useAlert } from '../components/AlertBanner.tsx';
import { fetchTemplates, createProjectApi } from '../lib/api-client.ts';
import { STARTER_TEMPLATES } from '../lib/starterTemplates.ts';
import { Layout, Eye, Plus, Search, Filter, ArrowRight, Sparkles, Check, Loader2 } from 'lucide-react';

interface TemplatesPageProps {
  navigate: (path: string) => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  const [templatesList, setTemplatesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cloningId, setCloningId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const apiTemplates = await fetchTemplates();
      // Combine API templates with STARTER_TEMPLATES to ensure all 7 are present with their full SVGs
      const combined = [...STARTER_TEMPLATES];
      for (const t of apiTemplates) {
        if (!combined.some(c => c.id === t.id)) {
          combined.push({
            id: t.id,
            name: t.name,
            description: t.description,
            category: t.category || 'General',
            picture: t.picture,
            price: 0,
            html: '',
            css: ''
          });
        }
      }
      setTemplatesList(combined);
      setLoading(false);
    };
    load();
  }, []);

  const categories = ['All', 'Forms & Registration', 'Forms & Surveys', 'Events & Programs', 'Bookings & Schedule', 'Portfolios'];

  const filteredTemplates = templatesList.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = async (template: any) => {
    if (!user) {
      navigate(`/login?redirect=/templates/preview/${template.id}`);
      return;
    }

    setCloningId(template.id);
    const res = await createProjectApi({
      title: `${template.name} Project`,
      templateId: template.id
    });
    setCloningId(null);

    if (res.ok && res.project) {
      showSuccess(`Created new project from ${template.name}`);
      navigate(`/editor/${res.project.id}`);
    } else {
      showError(res.error || 'Failed to create project from template');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Hero Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Pre-built University Starter Templates
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
          Template Gallery
        </h1>
        <p className="mt-3 text-base text-gray-600">
          Jumpstart your campus projects, lab registrations, course surveys, and student portfolios with ready-to-use responsive layouts.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <p className="text-base font-semibold">No templates found matching your search</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-3 text-sm text-blue-600 font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(tmpl => (
            <div
              key={tmpl.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Preview Image Card */}
                <div
                  className="w-full h-48 bg-slate-100 overflow-hidden border-b border-gray-100 cursor-pointer relative"
                  onClick={() => navigate(`/templates/preview/${tmpl.id}`)}
                >
                  <img
                    src={tmpl.picture}
                    alt={tmpl.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      Live Preview
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {tmpl.category}
                    </span>
                    {tmpl.price > 0 && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {tmpl.price} BDT
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{tmpl.name}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 pt-0 flex items-center gap-2 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/templates/preview/${tmpl.id}`)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUseTemplate(tmpl)}
                  disabled={cloningId === tmpl.id}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {cloningId === tmpl.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Use Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
