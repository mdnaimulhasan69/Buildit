import React, { useEffect, useState, useRef, useCallback } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { useAuth } from '../context/AuthContext.tsx';
import { fetchProjectById, saveProjectApi } from '../lib/api-client.ts';
import { ShieldAlert, Monitor, AlertTriangle } from 'lucide-react';
import { EditorToolbar, DeviceMode } from '../components/editor/EditorToolbar.tsx';
import { LeftPanel } from '../components/editor/LeftPanel.tsx';
import { RightPanel } from '../components/editor/RightPanel.tsx';
import { ImageUploadModal } from '../components/editor/ImageUploadModal.tsx';
import { VersionHistoryModal } from '../components/editor/VersionHistoryModal.tsx';
import {
  EDITOR_BLOCKS,
  CANVAS_BASE_CSS
} from '../components/editor/blockDefinitions.ts';

interface EditorPageProps {
  projectId: string;
  navigate: (path: string) => void;
}

const escapeHtml = (str: string): string => {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const EditorPage: React.FC<EditorPageProps> = ({ projectId, navigate }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [project, setProject] = useState<any | null>(null);
  const projectRef = useRef<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Screen width guard: boolean tooSmall (width below 1024)
  const [tooSmall, setTooSmall] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  // Editor states
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Editor | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<any | null>(null);
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [elementCount, setElementCount] = useState<number>(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Save states (Requirement 8)
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasUnsavedChangesRef = useRef(false);
  const [saveStatusText, setSaveStatusText] = useState<string | null>(null);
  const [saveStatusType, setSaveStatusType] = useState<'saved' | 'saving' | 'error' | 'unsaved' | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const isInitializingRef = useRef(true);

  // Keep projectRef synced
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // Keep hasUnsavedChangesRef synced
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Monitor screen width: update only when crossing 1024px boundary
  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 1024;
      setTooSmall((prev) => (prev !== isSmall ? isSmall : prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch project & verify ownership
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/login?redirect=/editor/${projectId}`);
      return;
    }

    async function loadProject() {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      const res = await fetchProjectById(projectId);
      if (res.ok && res.project) {
        setProject(res.project);
      } else {
        setError(res.error || 'Failed to open project.');
      }
      setLoading(false);
    }

    if (user) {
      loadProject();
    }
  }, [projectId, user, authLoading, navigate]);

  // Count total components on canvas
  const countComponents = useCallback((ed: Editor) => {
    try {
      const wrapper = ed.getWrapper();
      if (!wrapper) return;
      let count = 0;
      const walk = (comp: any) => {
        count++;
        const children = comp.components();
        if (children) {
          children.forEach((child: any) => walk(child));
        }
      };
      walk(wrapper);
      setElementCount(Math.max(0, count - 1));
    } catch (e) {
      // Ignore count error
    }
  }, []);

  // Helper to make component resizable (Requirement 7.2 & Rule D)
  const applyResizable = useCallback((comp: any) => {
    if (comp && !comp.is('wrapper')) {
      comp.set({
        resizable: {
          tl: 0,
          tc: 0,
          tr: 0,
          cl: 0,
          cr: 1, // right side
          bl: 0,
          bc: 1, // bottom
          br: 1, // bottom-right corner
          minDim: 20
        }
      });
    }
  }, []);

  // Permission check for saving (Requirement 8.7 & 28.4)
  // Owner, team host, and editors can save. Viewer cannot.
  const canSave = Boolean(
    user &&
    project &&
    (String(project.ownerId) === String(user.id) ||
     project.teamRole === 'host' ||
     project.teamRole === 'editor' ||
     !project.teamRole)
  );

  // Save handler (Requirement 8)
  const handleSave = useCallback(async (isAutoSave: boolean = false) => {
    if (isSavingRef.current || !editorInstanceRef.current || !projectRef.current) return;

    if (!canSave) {
      setSaveStatusText('You do not have permission to do this');
      setSaveStatusType('error');
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setSaveStatusText('Saving...');
    setSaveStatusType('saving');

    try {
      // Step 2: Gather layout and styles into one package
      const projectData = editorInstanceRef.current.getProjectData();
      const res = await saveProjectApi(projectId, projectData, isAutoSave);

      // Step 7 & 8: Server answers "saved" -> show "Saved" with time
      if (res.ok) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const successMsg = `Saved at ${timeStr}`;

        setSaveStatusText(successMsg);
        setSaveStatusType('saved');
        setHasUnsavedChanges(false);
        hasUnsavedChangesRef.current = false;

        if (res.updatedAt) {
          setProject((prev: any) => prev ? { ...prev, updatedAt: res.updatedAt } : prev);
        }
      } else {
        // Step 8 error handling: show exact message and keep changes on screen
        let errMsg = 'Could not save. Your changes are still here.';
        if (res.expired) {
          errMsg = 'Your login has expired. Please log in again.';
        } else if (res.status === 403 || res.error === 'You do not have permission to do this') {
          errMsg = 'You do not have permission to do this';
        } else if (res.error?.includes('too large') || res.error?.includes('5 MB')) {
          errMsg = 'This project is too large to save. Remove some images or elements.';
        } else if (res.error?.includes('Cannot reach the server')) {
          errMsg = 'Cannot reach the server. Check your connection and try again.';
        } else if (res.error) {
          errMsg = res.error;
        }

        setSaveStatusText(errMsg);
        setSaveStatusType('error');
      }
    } catch (err: any) {
      setSaveStatusText('Cannot reach the server. Check your connection and try again.');
      setSaveStatusType('error');
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [canSave, projectId]);

  // Autosave every 60 seconds while there are unsaved changes (Requirement 8.2)
  useEffect(() => {
    const timer = setInterval(() => {
      if (hasUnsavedChangesRef.current && !isSavingRef.current && canSave) {
        handleSave(true);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [canSave, handleSave]);

  // Warn if leaving browser tab or refreshing with unsaved changes (Requirement 8.4)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Back button confirmation (Requirement 8.4)
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true);
    } else {
      navigate('/dashboard');
    }
  }, [hasUnsavedChanges, navigate]);

  // Mark changes as unsaved
  const markUnsaved = useCallback(() => {
    if (isInitializingRef.current) return;
    setHasUnsavedChanges(true);
    hasUnsavedChangesRef.current = true;
    setSaveStatusText('Unsaved changes');
    setSaveStatusType('unsaved');
  }, []);

  // Restore snapshot version callback (Part 2B)
  const handleVersionRestored = useCallback((newCanvasData: any) => {
    if (!editorInstanceRef.current || !newCanvasData) return;
    try {
      editorInstanceRef.current.loadProjectData(newCanvasData);
      setHasUnsavedChanges(false);
      hasUnsavedChangesRef.current = false;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setSaveStatusText(`Saved at ${timeStr}`);
      setSaveStatusType('saved');
    } catch (err) {
      console.error('Failed to load restored project data:', err);
    }
  }, []);

  // Initialize GrapesJS editor once per opened project
  useEffect(() => {
    if (loading || error || !project || tooSmall || !editorContainerRef.current) return;
    if (editorInstanceRef.current) return;

    isInitializingRef.current = true;
    const currentProject = projectRef.current || project;
    const safeTitle = escapeHtml(currentProject.title || 'Untitled Project');

    // Check if project has saved GrapesJS editor data (Requirement 8.6)
    const canvasData = currentProject.canvasData;
    const hasSavedEditorData = Boolean(
      canvasData &&
      typeof canvasData === 'object' &&
      !canvasData.templateId &&
      ((Array.isArray(canvasData.pages) && canvasData.pages.length > 0 && canvasData.pages[0].frames?.length > 0) ||
       (Array.isArray(canvasData.components) && canvasData.components.length > 0))
    );

    // Default starter page for fresh projects
    let initialHtml = '';
    if (currentProject.canvasData?.html) {
      initialHtml = currentProject.canvasData.html;
    } else if (currentProject.canvasData?.templateId === 'sample-page' || currentProject.canvasData?.templateName) {
      initialHtml = `
        <div class="container-box" style="padding: 24px;">
          <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">Sample page</h1>
          <p style="font-size: 16px; color: #64748b; margin-bottom: 24px;">A clean starter template with a headline, sample image, and contact form.</p>
          <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" alt="Sample page banner" style="width: 100%; max-width: 800px; height: 320px; object-fit: cover; border-radius: 12px; margin-bottom: 32px; display: block;" />
          <form class="form-card" style="max-width: 500px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; font-weight: 700; color: #1e293b;">Get in Touch</h3>
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Full Name</label>
              <input type="text" placeholder="Your name" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" />
            </div>
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Email</label>
              <input type="email" placeholder="name@portcity.edu" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" />
            </div>
            <button type="submit" class="btn-primary" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">Submit</button>
          </form>
        </div>
      `;
    } else {
      initialHtml = `
        <div class="container-box" style="padding: 24px; min-height: 300px;">
          <h2 style="font-size: 26px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px;">${safeTitle}</h2>
          <p style="font-size: 15px; color: #64748b; margin-bottom: 24px;">Drag elements from the left panel onto this canvas to start building your page.</p>
        </div>
      `;
    }

    const ed = grapesjs.init({
      container: editorContainerRef.current,
      fromElement: false,
      height: '100%',
      width: '100%',
      storageManager: false,
      panels: { defaults: [] },
      deviceManager: {
        devices: [
          { id: 'desktop', name: 'Desktop', width: '' },
          { id: 'tablet', name: 'Tablet', width: '768px', widthMedia: '992px' },
          { id: 'phone', name: 'Phone', width: '360px', widthMedia: '480px' }
        ]
      },
      style: CANVAS_BASE_CSS,
      protectedCss: CANVAS_BASE_CSS,
      blockManager: {
        appendOnClick: true
      },
      // If we have saved project data, load it via loadProjectData; otherwise use initialHtml
      components: hasSavedEditorData ? undefined : initialHtml
    });

    // If project has saved editor data, load it instead of the starter page (Requirement 8.6)
    if (hasSavedEditorData) {
      try {
        ed.loadProjectData(canvasData);
      } catch (loadErr) {
        console.warn('Failed to load project data, using starter HTML:', loadErr);
        ed.setComponents(initialHtml);
      }
    }

    // Register all blocks into GrapesJS BlockManager with SVG media icons
    EDITOR_BLOCKS.forEach((block) => {
      ed.Blocks.add(block.id, {
        id: block.id,
        label: `<div class="gjs-custom-block-info"><span class="gjs-custom-block-title">${escapeHtml(block.label)}</span><span class="gjs-custom-block-desc">${escapeHtml(block.description)}</span></div>`,
        category: block.category,
        content: block.content,
        media: block.svgIcon,
        attributes: {
          class: 'gjs-block-custom',
          title: block.description
        }
      });
    });

    // Make starter components resizable
    const makeAllResizable = (comp: any) => {
      if (comp && !comp.is('wrapper')) {
        applyResizable(comp);
        const children = comp.components();
        if (children) {
          children.forEach((child: any) => makeAllResizable(child));
        }
      }
    };
    ed.getWrapper()?.components().forEach((c: any) => makeAllResizable(c));

    // Attach resizable to every newly created or added component
    ed.on('component:create', applyResizable);
    ed.on('component:add', applyResizable);

    // Component selection events
    ed.on('component:selected', (model) => {
      setSelectedComponent(model);
    });

    ed.on('component:deselected', () => {
      setSelectedComponent(null);
    });

    ed.on('component:update', () => {
      const selected = ed.getSelected();
      if (selected) {
        setSelectedComponent(selected);
      }
      countComponents(ed);
      markUnsaved();
    });

    ed.on('update', () => {
      countComponents(ed);
      markUnsaved();
    });

    ed.on('component:add component:remove', () => {
      countComponents(ed);
      markUnsaved();
    });

    // Repair 2: Deduplicate key handlers. Remove GrapesJS's default keymaps
    // so our unified handler executes exactly one undo or redo step per press.
    try {
      ed.Keymaps.remove('core:undo');
      ed.Keymaps.remove('core:redo');
    } catch {
      // Ignore if keymap not registered yet
    }

    // Single-step keyboard handler: Ctrl+Z (Undo 1 step), Ctrl+Y / Ctrl+Shift+Z (Redo 1 step), Delete
    const handleEditorKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // 1. Single-step Undo: Ctrl+Z (without shift)
      if (isCtrlOrMeta && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        const active = e.target as HTMLElement;
        const isEditingInput =
          active &&
          (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
        if (!isEditingInput) {
          e.preventDefault();
          ed.UndoManager?.undo();
          countComponents(ed);
          markUnsaved();
          return;
        }
      }

      // 2. Single-step Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (isCtrlOrMeta && (e.key === 'y' || e.key === 'Y')) ||
        (isCtrlOrMeta && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        const active = e.target as HTMLElement;
        const isEditingInput =
          active &&
          (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
        if (!isEditingInput) {
          e.preventDefault();
          ed.UndoManager?.redo();
          countComponents(ed);
          markUnsaved();
          return;
        }
      }

      // 3. Delete selected element
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = e.target as HTMLElement;
        const isEditingInput =
          active &&
          (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
        if (!isEditingInput) {
          const selected = ed.getSelected();
          if (selected && selected.is('wrapper') === false) {
            e.preventDefault();
            selected.remove();
            setSelectedComponent(null);
            countComponents(ed);
            markUnsaved();
          }
        }
      }
    };

    window.addEventListener('keydown', handleEditorKeyDown);

    // Also attach to canvas iframe document once loaded
    ed.on('canvas:load', () => {
      try {
        const doc = ed.Canvas.getDocument();
        doc?.addEventListener('keydown', handleEditorKeyDown);
      } catch {
        // Ignore
      }
    });

    try {
      const doc = ed.Canvas.getDocument();
      doc?.addEventListener('keydown', handleEditorKeyDown);
    } catch {
      // Ignore
    }

    editorInstanceRef.current = ed;
    (window as any).__grapesEditor = ed;
    setEditor(ed);
    countComponents(ed);

    // Initialization complete: subsequent edits will mark project as unsaved
    setTimeout(() => {
      isInitializingRef.current = false;
    }, 300);

    return () => {
      window.removeEventListener('keydown', handleEditorKeyDown);
      ed.destroy();
      editorInstanceRef.current = null;
      setEditor(null);
    };
  }, [loading, error, !project, tooSmall, projectId, countComponents, applyResizable, markUnsaved]);

  // Switch canvas device view (Requirement 7.7)
  const handleDeviceChange = (mode: DeviceMode) => {
    setDevice(mode);
    if (editorInstanceRef.current) {
      editorInstanceRef.current.setDevice(mode);
    }
  };

  // Insert uploaded & sanitized image (Requirement 7.6 & 28.5)
  const handleInsertImage = (dataUrl: string, altText: string) => {
    if (!editorInstanceRef.current) return;
    const ed = editorInstanceRef.current;
    const safeAlt = escapeHtml(altText);
    const imgHtml = `<img src="${dataUrl}" alt="${safeAlt}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; display: block; margin: 16px 0;" />`;

    const selected = ed.getSelected();
    if (selected && selected.is('wrapper') === false && typeof selected.append === 'function') {
      selected.append(imgHtml);
    } else {
      ed.addComponents(imgHtml);
    }
    countComponents(ed);
    markUnsaved();
  };

  // Delete selected element
  const handleDeleteSelected = () => {
    if (!editorInstanceRef.current) return;
    const selected = editorInstanceRef.current.getSelected();
    if (selected && selected.is('wrapper') === false) {
      selected.remove();
      setSelectedComponent(null);
      countComponents(editorInstanceRef.current);
      markUnsaved();
    }
  };

  // Update style property on selected element
  const handleUpdateStyle = (prop: string, val: string) => {
    if (!selectedComponent) return;
    try {
      selectedComponent.addStyle({ [prop]: val });
      markUnsaved();
    } catch (e) {
      console.warn('Error applying style:', e);
    }
  };

  // Update attribute on selected element
  const handleUpdateAttribute = (attr: string, val: string) => {
    if (!selectedComponent) return;
    try {
      selectedComponent.addAttributes({ [attr]: val });
      markUnsaved();
    } catch (e) {
      console.warn('Error applying attribute:', e);
    }
  };

  // 200 elements stress test (Requirement 7.9)
  const handle200ElementsTest = () => {
    if (!editorInstanceRef.current) return;
    const ed = editorInstanceRef.current;
    let stressHtml = `
      <div class="container-box" style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e293b;">200 Elements Benchmark Grid</h3>
        <p style="font-size: 13px; color: #64748b;">Testing responsiveness with 200 active elements on the canvas (Requirement 7.9).</p>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
    `;
    for (let i = 1; i <= 200; i++) {
      stressHtml += `<span style="display: inline-block; padding: 4px 8px; font-size: 11px; font-weight: 600; background: #e0e7ff; color: #3730a3; border-radius: 4px; border: 1px solid #c7d2fe;">Item #${i}</span>`;
    }
    stressHtml += `</div></div>`;
    ed.addComponents(stressHtml);
    countComponents(ed);
    markUnsaved();
  };

  // Screen width guard: screen must be >= 1024px
  if (tooSmall) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Screen Too Small</h2>
          <p className="text-sm text-gray-700 font-medium leading-relaxed mb-6">
            The editor needs a screen at least 1024 pixels wide. Please use a laptop or desktop computer.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-gray-500 text-sm font-medium">
        Starting up, please wait
      </div>
    );
  }

  // Access control check: "You do not have permission to do this"
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">{error}</h2>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* Top Bar with Save Button and Status (Requirement 8) */}
      <EditorToolbar
        title={project?.title || 'Untitled Project'}
        device={device}
        onDeviceChange={handleDeviceChange}
        onOpenImageUpload={() => setIsImageModalOpen(true)}
        onDeleteSelected={handleDeleteSelected}
        hasSelectedElement={!!selectedComponent && selectedComponent.is('wrapper') === false}
        elementCount={elementCount}
        onAdd200ElementsTest={handle200ElementsTest}
        onBack={handleBack}
        onSave={() => handleSave(false)}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        canSave={canSave}
        saveStatusText={saveStatusText}
        saveStatusType={saveStatusType}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main 3-Column Editor Layout (Requirement 7.1) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Elements, Form fields, Widgets */}
        <LeftPanel
          editor={editor}
          onOpenImageUpload={() => setIsImageModalOpen(true)}
        />

        {/* Center: Canvas (Wrapper + GrapesJS container) */}
        <main className="flex-1 bg-slate-100 flex flex-col p-4 overflow-hidden relative">
          <div className="relative flex-1 min-w-0 min-h-0 bg-white shadow-md rounded-lg overflow-hidden">
            <div
              id="gjs-canvas"
              ref={editorContainerRef}
              className="absolute inset-0"
            />
          </div>
        </main>

        {/* Right Panel: Style settings */}
        <RightPanel
          selectedComponent={selectedComponent}
          onUpdateStyle={handleUpdateStyle}
          onUpdateAttribute={handleUpdateAttribute}
          onDeleteSelected={handleDeleteSelected}
        />
      </div>

      {/* Image Upload Modal (Requirement 7.6 & 28.5) */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertImage={handleInsertImage}
      />

      {/* Version History Modal (Part 2B & Requirement 9) */}
      <VersionHistoryModal
        projectId={projectId}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestored={handleVersionRestored}
      />

      {/* Leave confirmation modal when unsaved changes exist (Requirement 8.4) */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Unsaved changes</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              You have unsaved changes in your project. Do you want to leave without saving?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Stay in editor
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLeaveConfirm(false);
                  navigate('/dashboard');
                }}
                className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Leave without saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
