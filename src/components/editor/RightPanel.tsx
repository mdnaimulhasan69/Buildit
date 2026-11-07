import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Type,
  Square,
  Maximize2,
  Trash2,
  Palette,
  MousePointer,
  CheckCircle2,
  LayoutGrid
} from 'lucide-react';

interface RightPanelProps {
  selectedComponent: any | null;
  onUpdateStyle: (property: string, value: string) => void;
  onUpdateAttribute: (attr: string, value: string) => void;
  onDeleteSelected: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedComponent,
  onUpdateStyle,
  onUpdateAttribute,
  onDeleteSelected
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'properties'>('style');

  // Local style states
  const [styles, setStyles] = useState<{ [key: string]: string }>({});
  const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
  const [tagName, setTagName] = useState<string>('');

  useEffect(() => {
    if (!selectedComponent) {
      setStyles({});
      setAttributes({});
      setTagName('');
      return;
    }

    try {
      const tag = selectedComponent.get('tagName') || selectedComponent.get('type') || 'element';
      setTagName(tag.toUpperCase());

      const currentStyles = selectedComponent.getStyle() || {};
      setStyles({ ...currentStyles });

      const currentAttrs = selectedComponent.getAttributes() || {};
      setAttributes({ ...currentAttrs });
    } catch (e) {
      console.warn('Error reading component data:', e);
    }
  }, [selectedComponent]);

  const handleStyleChange = (prop: string, val: string) => {
    setStyles((prev) => ({ ...prev, [prop]: val }));
    onUpdateStyle(prop, val);
  };

  const handleAttrChange = (attr: string, val: string) => {
    setAttributes((prev) => ({ ...prev, [attr]: val }));
    onUpdateAttribute(attr, val);
  };

  if (!selectedComponent) {
    return (
      <aside className="w-72 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 select-none">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Style Settings
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-gray-400">
            <MousePointer className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-gray-600 mb-1">
            No element selected
          </p>
          <p className="text-[11px] text-gray-400 max-w-[200px]">
            Click any text, button, container or image on the canvas to edit styles.
          </p>
        </div>
      </aside>
    );
  }

  const isTextElement = ['H1', 'H2', 'H3', 'H4', 'P', 'SPAN', 'A', 'BUTTON', 'LABEL', 'TEXT'].includes(tagName);
  const isImageElement = tagName === 'IMG' || tagName === 'IMAGE';
  const isInputElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName);
  const isLinkElement = tagName === 'A' || tagName === 'LINK';

  return (
    <aside className="w-72 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Element Header */}
      <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-gray-800">
            &lt;{tagName}&gt;
          </span>
        </div>
        <button
          type="button"
          onClick={onDeleteSelected}
          className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:bg-red-50 px-2 py-0.5 rounded transition-colors"
          title="Delete selected element"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors text-center ${
            activeTab === 'style'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Styles
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors text-center ${
            activeTab === 'properties'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Attributes
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {activeTab === 'style' ? (
          <>
            {/* Typography */}
            {isTextElement && (
              <section className="space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-gray-700 border-b border-gray-100 pb-1">
                  <Type className="w-3.5 h-3.5 text-blue-600" />
                  <span>Typography</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Font Size</label>
                    <input
                      type="text"
                      value={styles['font-size'] || ''}
                      onChange={(e) => handleStyleChange('font-size', e.target.value)}
                      placeholder="e.g. 16px"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Font Weight</label>
                    <select
                      value={styles['font-weight'] || ''}
                      onChange={(e) => handleStyleChange('font-weight', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white"
                    >
                      <option value="">Default</option>
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semibold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styles['color'] || '#1e293b'}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                      className="w-7 h-7 p-0 rounded border border-gray-300 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={styles['color'] || ''}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                      placeholder="#1e293b"
                      className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Alignment</label>
                  <div className="grid grid-cols-4 gap-1 bg-slate-100 p-0.5 rounded">
                    {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => handleStyleChange('text-align', align)}
                        className={`py-1 text-[10px] font-semibold rounded capitalize ${
                          styles['text-align'] === align
                            ? 'bg-white text-blue-600 shadow-2xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Colors & Background */}
            <section className="space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-gray-700 border-b border-gray-100 pb-1">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>Colors & Background</span>
              </div>

              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles['background-color'] || '#ffffff'}
                    onChange={(e) => handleStyleChange('background-color', e.target.value)}
                    className="w-7 h-7 p-0 rounded border border-gray-300 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={styles['background-color'] || ''}
                    onChange={(e) => handleStyleChange('background-color', e.target.value)}
                    placeholder="transparent or #ffffff"
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                  />
                </div>
              </div>
            </section>

            {/* Spacing (Margin & Padding) */}
            <section className="space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-gray-700 border-b border-gray-100 pb-1">
                <Square className="w-3.5 h-3.5 text-blue-600" />
                <span>Spacing</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Padding</label>
                  <input
                    type="text"
                    value={styles['padding'] || ''}
                    onChange={(e) => handleStyleChange('padding', e.target.value)}
                    placeholder="e.g. 16px"
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Margin</label>
                  <input
                    type="text"
                    value={styles['margin'] || ''}
                    onChange={(e) => handleStyleChange('margin', e.target.value)}
                    placeholder="e.g. 12px 0"
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                  />
                </div>
              </div>
            </section>

            {/* Dimensions (Size) */}
            <section className="space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-gray-700 border-b border-gray-100 pb-1">
                <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Size</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Width</label>
                  <input
                    type="text"
                    value={styles['width'] || ''}
                    onChange={(e) => handleStyleChange('width', e.target.value)}
                    placeholder="e.g. 100% or 400px"
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Max Width</label>
                  <input
                    type="text"
                    value={styles['max-width'] || ''}
                    onChange={(e) => handleStyleChange('max-width', e.target.value)}
                    placeholder="e.g. 600px"
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Height</label>
                  <input
                    type="text"
                    value={styles['height'] || ''}
                    onChange={(e) => handleStyleChange('height', e.target.value)}
                    placeholder="auto"
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Min Height</label>
                  <input
                    type="text"
                    value={styles['min-height'] || ''}
                    onChange={(e) => handleStyleChange('min-height', e.target.value)}
                    placeholder="e.g. 60px"
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                  />
                </div>
              </div>
            </section>

            {/* Borders & Corners */}
            <section className="space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-gray-700 border-b border-gray-100 pb-1">
                <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                <span>Borders</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Border Width</label>
                  <input
                    type="text"
                    value={styles['border-width'] || ''}
                    onChange={(e) => handleStyleChange('border-width', e.target.value)}
                    placeholder="e.g. 1px"
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Border Style</label>
                  <select
                    value={styles['border-style'] || 'none'}
                    onChange={(e) => handleStyleChange('border-style', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white"
                  >
                    <option value="none">None</option>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Border Color</label>
                  <input
                    type="text"
                    value={styles['border-color'] || ''}
                    onChange={(e) => handleStyleChange('border-color', e.target.value)}
                    placeholder="#e2e8f0"
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Corner Radius</label>
                  <input
                    type="text"
                    value={styles['border-radius'] || ''}
                    onChange={(e) => handleStyleChange('border-radius', e.target.value)}
                    placeholder="e.g. 8px"
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                  />
                </div>
              </div>
            </section>
          </>
        ) : (
          /* Attributes & Properties */
          <section className="space-y-3">
            {isLinkElement && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Link URL (href)
                </label>
                <input
                  type="text"
                  value={attributes['href'] || ''}
                  onChange={(e) => handleAttrChange('href', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs"
                />
              </div>
            )}

            {isImageElement && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Image Source (src)
                  </label>
                  <input
                    type="text"
                    value={attributes['src'] || ''}
                    onChange={(e) => handleAttrChange('src', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={attributes['alt'] || ''}
                    onChange={(e) => handleAttrChange('alt', e.target.value)}
                    placeholder="Image description"
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs"
                  />
                </div>
              </>
            )}

            {isInputElement && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={attributes['placeholder'] || ''}
                    onChange={(e) => handleAttrChange('placeholder', e.target.value)}
                    placeholder="Input placeholder"
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={attributes['name'] || ''}
                    onChange={(e) => handleAttrChange('name', e.target.value)}
                    placeholder="Field name"
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Element ID
              </label>
              <input
                type="text"
                value={attributes['id'] || ''}
                onChange={(e) => handleAttrChange('id', e.target.value)}
                placeholder="optional-id"
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                CSS Classes
              </label>
              <input
                type="text"
                value={attributes['class'] || ''}
                onChange={(e) => handleAttrChange('class', e.target.value)}
                placeholder="custom-class"
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs"
              />
            </div>
          </section>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          <span>Updates live on canvas</span>
        </span>
      </div>
    </aside>
  );
};
