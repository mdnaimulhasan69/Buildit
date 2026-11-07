import React, { useState, useEffect } from 'react';
import { fetchSnapshots, fetchSnapshotById, restoreSnapshotApi } from '../../lib/api-client.ts';
import { History, Clock, User, RotateCcw, Eye, X, AlertTriangle, Check, Loader2 } from 'lucide-react';

interface VersionHistoryModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestored: (newCanvasData: any) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onRestored
}) => {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preview state
  const [previewSnapshot, setPreviewSnapshot] = useState<any | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Restore confirm dialog state
  const [confirmSnapshot, setConfirmSnapshot] = useState<any | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSnapshots();
    } else {
      setPreviewSnapshot(null);
      setConfirmSnapshot(null);
    }
  }, [isOpen, projectId]);

  const loadSnapshots = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await fetchSnapshots(projectId);
    if (res.ok && res.snapshots) {
      setSnapshots(res.snapshots);
    } else {
      setErrorMsg(res.error || 'Failed to load version history');
    }
    setLoading(false);
  };

  const handlePreview = async (snapshotId: string) => {
    setPreviewLoading(true);
    const res = await fetchSnapshotById(projectId, snapshotId);
    if (res.ok && res.snapshot) {
      setPreviewSnapshot(res.snapshot);
    } else {
      setErrorMsg(res.error || 'Failed to load preview');
    }
    setPreviewLoading(false);
  };

  const handleConfirmRestore = async () => {
    if (!confirmSnapshot) return;
    setRestoring(true);
    const res = await restoreSnapshotApi(projectId, confirmSnapshot.id);
    setRestoring(false);

    if (res.ok && res.project) {
      onRestored(res.project.canvasData);
      setConfirmSnapshot(null);
      setPreviewSnapshot(null);
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to restore snapshot');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      {/* Slide-over Drawer */}
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-50">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Version History</h2>
              <p className="text-xs text-gray-500">Up to 20 past saved snapshots</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {errorMsg && (
            <div className="p-3 text-xs rounded-lg bg-red-50 border border-red-200 text-red-700 mb-4">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
              <span className="text-sm">Loading versions...</span>
            </div>
          ) : snapshots.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-gray-600">No versions saved yet</p>
              <p className="text-xs text-gray-400 mt-1">
                A snapshot is created whenever you click &quot;Save&quot; in the editor.
              </p>
            </div>
          ) : (
            snapshots.map((snap, index) => {
              const date = new Date(snap.createdAt);
              const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div
                  key={snap.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      {formattedDate} at {formattedTime}
                    </span>
                    {index === 0 && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Latest
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      Saved by {snap.savedBy || 'Owner'}
                    </span>
                    {snap.label && (
                      <span className="italic text-gray-400 truncate max-w-[140px]">
                        {snap.label}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => handlePreview(snap.id)}
                      disabled={previewLoading}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmSnapshot(snap)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-gray-100 bg-slate-50 text-xs text-gray-500">
          Restoring creates an automatic backup of your current project state first.
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmSnapshot && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Restore this version?</h3>
            </div>
            <p className="text-sm text-gray-600">
              Your current canvas will be replaced with the version saved on{' '}
              <strong className="text-gray-900">
                {new Date(confirmSnapshot.createdAt).toLocaleString()}
              </strong>
              . A backup of your current work will be automatically saved.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSnapshot(null)}
                className="px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={restoring}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {restoring ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Restore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewSnapshot && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-3.5 border-b border-gray-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-sm">
                  Snapshot Preview ({new Date(previewSnapshot.createdAt).toLocaleString()})
                </span>
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Read-only
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmSnapshot(previewSnapshot);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore this version</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSnapshot(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto p-4">
                {/* Renders preview container */}
                <div
                  className="preview-content-area"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      const data = previewSnapshot.canvasData;
                      if (!data) return '<p class="text-gray-400 p-8 text-center">Empty version</p>';
                      // If HTML is stored in data.html
                      if (data.html) {
                        return `<style>${data.css || ''}</style>${data.html}`;
                      }
                      if (typeof data === 'string') {
                        return data;
                      }
                      // If GrapesJS pages
                      if (Array.isArray(data.pages) && data.pages[0]?.frames?.[0]?.component) {
                        return '<div class="p-8 text-center text-gray-500 font-sans">Preview rendered from project structure. Click &quot;Restore&quot; to load this version into the editor.</div>';
                      }
                      return '<div class="p-8 text-center text-gray-500 font-sans">Saved layout data present. Click &quot;Restore&quot; to inspect in full interactive editor.</div>';
                    })()
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
