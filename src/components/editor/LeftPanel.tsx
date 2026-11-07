import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Search } from 'lucide-react';
import { EDITOR_BLOCKS } from './blockDefinitions.ts';

interface LeftPanelProps {
  editor: any | null;
  onOpenImageUpload: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  editor,
  onOpenImageUpload
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Elements' | 'Form fields' | 'Widgets'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasResults, setHasResults] = useState(true);
  const blocksContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor || !blocksContainerRef.current) return;

    try {
      const all = editor.Blocks.getAll();
      if (!all || typeof all.filter !== 'function') return;

      const filtered = all.filter((b: any) => {
        const cat = b.getCategoryLabel() || b.get('category') || '';
        const def = EDITOR_BLOCKS.find((item) => item.id === (b.getId ? b.getId() : b.get('id')));
        const label = def?.label || b.getLabel() || '';
        const desc = def?.description || '';

        const matchesTab = activeTab === 'All' || cat.toLowerCase() === activeTab.toLowerCase();
        const s = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !s ||
          label.toLowerCase().includes(s) ||
          desc.toLowerCase().includes(s) ||
          cat.toLowerCase().includes(s);

        return matchesTab && matchesSearch;
      });

      setHasResults(filtered.length > 0);

      const renderedEl = editor.Blocks.render(filtered, { external: true });
      if (blocksContainerRef.current) {
        blocksContainerRef.current.innerHTML = '';
        if (renderedEl) {
          blocksContainerRef.current.appendChild(renderedEl);
        }
      }
    } catch (err) {
      console.error('Error rendering GrapesJS blocks:', err);
    }
  }, [editor, activeTab, searchQuery]);

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Panel Title & Quick Image Action */}
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Add to Canvas
        </h2>
        <button
          type="button"
          onClick={onOpenImageUpload}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          title="Upload JPG, PNG, WebP or SVG up to 5 MB"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search elements & widgets..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50/50 p-1 gap-1">
        {(['All', 'Elements', 'Form fields', 'Widgets'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 px-1.5 text-[11px] font-semibold rounded-md transition-colors text-center truncate ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* GrapesJS Blocks Container */}
      <div className="flex-1 overflow-y-auto p-3">
        {!hasResults && (
          <div className="py-8 text-center text-xs text-gray-400">
            No matching items found
          </div>
        )}
        <div id="gjs-blocks-container" ref={blocksContainerRef} />
      </div>

      {/* Helper Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-gray-200 text-[11px] text-gray-500 text-center">
        Drag or click any item to add to the canvas
      </div>
    </aside>
  );
};
