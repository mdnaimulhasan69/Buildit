import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useAlert } from '../components/AlertBanner.tsx';
import { STARTER_TEMPLATES, StarterTemplateDef } from '../lib/starterTemplates.ts';
import { createProjectApi } from '../lib/api-client.ts';
import { ArrowLeft, Plus, AlertCircle, Sparkles, Check, Loader2 } from 'lucide-react';

interface LivePreviewPageProps {
  templateId?: string;
  navigate: (path: string) => void;
}

export const LivePreviewPage: React.FC<LivePreviewPageProps> = ({ templateId, navigate }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  const [template, setTemplate] = useState<StarterTemplateDef | null>(null);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    // If templateId provided or extract from window.location.pathname
    const id = templateId || window.location.pathname.replace('/templates/preview/', '');
    const found = STARTER_TEMPLATES.find(t => t.id === id) || STARTER_TEMPLATES[0];
    setTemplate(found);
  }, [templateId]);

  const handleUseTemplate = async () => {
    if (!template) return;
    if (!user) {
      navigate(`/login?redirect=/templates/preview/${template.id}`);
      return;
    }

    setCloning(true);
    const res = await createProjectApi({
      title: `${template.name} Project`,
      templateId: template.id
    });
    setCloning(false);

    if (res.ok && res.project) {
      showSuccess(`Created project from ${template.name}`);
      navigate(`/editor/${res.project.id}`);
    } else {
      showError(res.error || 'Failed to clone template');
    }
  };

  if (!template) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top Banner with exact requirement disclaimer */}
      <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between shadow-sm z-30 shrink-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold max-w-2xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-100" />
          <span>This is a preview. Nothing you type is saved.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Templates</span>
          </button>

          <button
            type="button"
            onClick={handleUseTemplate}
            disabled={cloning}
            className="text-xs font-bold px-3.5 py-1.5 rounded-md bg-white text-gray-900 hover:bg-gray-100 shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {cloning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Use this template</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subheader info bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900 text-base">{template.name}</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wider">
            {template.category}
          </span>
        </div>
        <span className="text-xs text-gray-500 hidden sm:inline">
          Full interactive preview in standard web canvas
        </span>
      </div>

      {/* Rendered Template Canvas */}
      <main className="flex-1 p-6 overflow-auto flex justify-center items-start">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden min-h-[600px] p-6 sm:p-10">
          <style dangerouslySetInnerHTML={{ __html: template.css }} />
          <div dangerouslySetInnerHTML={{ __html: template.html }} />
        </div>
      </main>
    </div>
  );
};
