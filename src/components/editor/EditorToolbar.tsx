import React from 'react';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Image as ImageIcon,
  Trash2,
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History
} from 'lucide-react';

export type DeviceMode = 'desktop' | 'tablet' | 'phone';

interface EditorToolbarProps {
  title: string;
  device: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
  onOpenImageUpload: () => void;
  onDeleteSelected: () => void;
  hasSelectedElement: boolean;
  elementCount: number;
  onAdd200ElementsTest: () => void;
  onBack: () => void;

  // Save controls (Requirement 8)
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  canSave: boolean;
  saveStatusText?: string | null;
  saveStatusType?: 'saved' | 'saving' | 'error' | 'unsaved' | null;

  // Version history (Part 2B)
  onOpenHistory?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  title,
  device,
  onDeviceChange,
  onOpenImageUpload,
  onDeleteSelected,
  hasSelectedElement,
  elementCount,
  onAdd200ElementsTest,
  onBack,
  onSave,
  isSaving,
  hasUnsavedChanges,
  canSave,
  saveStatusText,
  saveStatusType,
  onOpenHistory
}) => {
  return (
    <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Back + Project Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Back to dashboard"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="h-5 w-px bg-gray-200" />

        <div className="flex items-center gap-2 max-w-xs sm:max-w-md">
          <span className="font-bold text-gray-900 text-sm sm:text-base truncate" title={title}>
            {title}
          </span>
          <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Draft
          </span>
        </div>
      </div>

      {/* Center: Device Switcher (Requirement 7.7) */}
      <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => onDeviceChange('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            device === 'desktop'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Desktop view"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Desktop</span>
        </button>

        <button
          type="button"
          onClick={() => onDeviceChange('tablet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            device === 'tablet'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Tablet view (768px)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span>Tablet</span>
        </button>

        <button
          type="button"
          onClick={() => onDeviceChange('phone')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            device === 'phone'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Phone view (360px)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Phone</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Canvas elements counter (Requirement 7.9) */}
        <div
          className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 bg-slate-50 border border-gray-200 rounded-md"
          title="Total canvas elements (tested up to 200 elements)"
        >
          <Layers className="w-3.5 h-3.5 text-gray-400" />
          <span>{elementCount} elements</span>
        </div>

        {/* 200 elements stress test button */}
        <button
          type="button"
          onClick={onAdd200ElementsTest}
          className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
          title="Load 200 elements to verify canvas stays smooth (Requirement 7.9)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>200 Elements Test</span>
        </button>

        {/* Add Image Button (Requirement 7.6) */}
        <button
          type="button"
          onClick={onOpenImageUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-2xs transition-colors"
          title="Add an image in JPG, PNG, WebP or SVG format (up to 5 MB)"
        >
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>Add Image</span>
        </button>

        {/* Delete Element Button */}
        <button
          type="button"
          onClick={onDeleteSelected}
          disabled={!hasSelectedElement}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            hasSelectedElement
              ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
              : 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed opacity-60'
          }`}
          title="Delete selected element (or press Delete key)"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        {/* Save Status Text (Requirement 8.3 & exact messages) */}
        {saveStatusText && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all max-w-xs truncate ${
              saveStatusType === 'saved'
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : saveStatusType === 'error'
                ? 'text-red-700 bg-red-50 border border-red-200 animate-pulse'
                : saveStatusType === 'saving'
                ? 'text-blue-700 bg-blue-50 border border-blue-200'
                : 'text-amber-700 bg-amber-50 border border-amber-200'
            }`}
            title={saveStatusText}
            role="status"
          >
            {saveStatusType === 'saved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            {saveStatusType === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
            {saveStatusType === 'saving' && <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />}
            {saveStatusType === 'unsaved' && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
            <span className="truncate">{saveStatusText}</span>
          </div>
        )}

        {/* History Button (Part 2B) */}
        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-2xs transition-colors"
            title="View saved version history and snapshots"
          >
            <History className="w-3.5 h-3.5 text-gray-500" />
            <span>History</span>
          </button>
        )}

        {/* Save Button (Requirement 8.1 & 8.7: switched off for viewers) */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !canSave}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all ${
            !canSave
              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
              : hasUnsavedChanges
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer ring-2 ring-blue-500/20'
              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
          }`}
          title={!canSave ? 'Viewers cannot save projects' : hasUnsavedChanges ? 'Save changes to server' : 'All changes saved'}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
