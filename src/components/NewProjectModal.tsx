import React, { useState, useEffect } from 'react';
import { X, FileText, Layout, Check } from 'lucide-react';
import { Template } from '../types/index.ts';
import { fetchTemplates, createProjectApi } from '../lib/api-client.ts';
import { validateProjectTitle } from '../lib/validation.ts';
import { useAlert } from './AlertBanner.tsx';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const { showSuccess, showError } = useAlert();
  const [projectType, setProjectType] = useState<'blank' | 'template'>('blank');
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      async function loadTemplates() {
        setLoadingTemplates(true);
        const data = await fetchTemplates();
        setTemplates(data);
        if (data.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(data[0].id);
        }
        setLoadingTemplates(false);
      }
      loadTemplates();
      setTitleError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (titleError) {
      setTitleError(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const titleCheck = validateProjectTitle(title);
    if (!titleCheck.valid) {
      setTitleError(titleCheck.error || 'This field is required');
      return;
    }

    if (projectType === 'template' && !selectedTemplateId) {
      showError('Please select a template');
      return;
    }

    setIsSubmitting(true);

    const res = await createProjectApi({
      title: title.trim(),
      templateId: projectType === 'template' ? selectedTemplateId : undefined
    });

    setIsSubmitting(false);

    if (!res.ok) {
      if (res.field === 'title' && res.error) {
        setTitleError(res.error);
      } else if (res.error) {
        showError(res.error);
      }
      return;
    }

    if (res.project) {
      showSuccess('Project created successfully');
      setTitle('');
      setTitleError(null);
      onClose();
      onProjectCreated(res.project);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900">
            New project
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleCreate} className="p-6 space-y-6" noValidate>
          {/* Choices: Blank canvas vs Choose a template (Requirement 6.1) */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Starting point
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProjectType('blank')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  projectType === 'blank'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  {projectType === 'blank' && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="font-semibold text-gray-900 text-sm">Blank canvas</div>
                <div className="text-xs text-gray-500 mt-0.5">Start with an empty page</div>
              </button>

              <button
                type="button"
                onClick={() => setProjectType('template')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  projectType === 'template'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Layout className="w-4 h-4" />
                  </div>
                  {projectType === 'template' && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="font-semibold text-gray-900 text-sm">Choose a template</div>
                <div className="text-xs text-gray-500 mt-0.5">Copy a ready-made design</div>
              </button>
            </div>
          </div>

          {/* Template picker list when "Choose a template" is selected */}
          {projectType === 'template' && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Available templates
              </label>
              {loadingTemplates ? (
                <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-xl">
                  Starting up, please wait
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`cursor-pointer rounded-xl border p-3 flex gap-3 items-center transition-all ${
                        selectedTemplateId === tpl.id
                          ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <img
                        src={tpl.picture}
                        alt={tpl.name}
                        className="w-14 h-10 object-cover rounded border border-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">
                          {tpl.name}
                        </div>
                        <div className="text-[11px] text-gray-500 line-clamp-1">
                          {tpl.description}
                        </div>
                      </div>
                      {selectedTemplateId === tpl.id && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title Field (Requirement 6.1 & 6.2) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="project-title" className="block text-sm font-semibold text-gray-800">
                Title
              </label>
              <span className={`text-xs ${title.length > 80 ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                {title.length}/80
              </span>
            </div>
            <input
              id="project-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              maxLength={85}
              placeholder="e.g. CSE-322 Class Survey"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                titleError ? 'border-red-400 bg-red-50/20 text-red-900' : 'border-gray-300 text-gray-900'
              }`}
            />
            {titleError && (
              <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                {titleError}
              </p>
            )}
          </div>

          {/* Dialog Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Starting up, please wait' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
