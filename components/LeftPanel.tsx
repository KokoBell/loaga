import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../hooks/useProject';
import { useDrag } from 'react-dnd';
import { HTML5_SEMANTIC_TAGS } from '../constants';
import { ItemType, Element, Component } from '../types';
import { zipAndDownloadProject } from '../utils/fileUtils';
import { generateCSS, generateHTML } from '../utils/codeGenerator';

const DraggableItem = ({ type, item, name }: { type: string, item: any, name: string }) => {
  const { setIsDragging } = useProject();
  const [{ isDragging }, drag] = useDrag(() => ({
    type, 
    item: () => {
      setIsDragging(true);
      return item;
    },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    end: (_item, _monitor) => {
      setIsDragging(false);
    },
  }));
  const ref = React.useRef<HTMLDivElement>(null);
  drag(ref);
  return (
    <div ref={ref} className="p-2 bg-background-med rounded cursor-move hover:bg-border-color text-sm text-center" style={{ opacity: isDragging ? 0.5 : 1 }}>
      {name}
    </div>
  );
};

const NewItemForm = ({ type, onDone, placeholder, prefix, suffix }: { type: 'Page' | 'Script' | 'Style' | 'Component', onDone: (name: string | null) => void, placeholder: string, prefix?: string, suffix?: string }) => {
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            let finalName = name.trim();
            if (prefix && !finalName.startsWith(prefix)) finalName = prefix + finalName;
            if (suffix && !finalName.endsWith(suffix)) finalName += suffix;
            onDone(finalName);
        } else {
            onDone(null);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-1 p-1">
            <input 
                ref={inputRef} type="text" value={name} onChange={e => setName(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Escape') onDone(null); }} placeholder={placeholder}
                className="flex-1 p-1 bg-background-med border border-border-color rounded text-sm w-full"
            />
            <button type="submit" aria-label={`Confirm new ${type}`} className="p-1.5 hover:bg-accent-green rounded text-text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </button>
            <button type="button" aria-label={`Cancel new ${type}`} onClick={() => onDone(null)} className="p-1.5 hover:bg-accent-red rounded text-text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </form>
    );
};

const ElementNode = React.memo(({ element, level }: { element: Element, level: number }) => {
    const { state, selectElement } = useProject();
    const isSelected = state.selectedElementId === element.id;
    const nodeRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isSelected) {
            nodeRef.current?.focus({ preventScroll: true });
        }
    }, [isSelected]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectElement(element.id);
        }
    };

    return (
        <>
            <div
                ref={nodeRef}
                onClick={(e) => { e.stopPropagation(); selectElement(element.id); }}
                onKeyDown={handleKeyDown}
                tabIndex={isSelected ? 0 : -1}
                role="treeitem"
                aria-selected={isSelected}
                className={`pr-2 py-1 text-sm cursor-pointer rounded flex items-center justify-between group ${isSelected ? 'bg-accent-blue text-white' : 'hover:bg-background-med'}`}
                style={{ paddingLeft: `${level * 1}rem` }}
            >
                <span>&lt;{element.tag}&gt;</span>
            </div>
            {element.children?.map(child => (
                <ElementNode key={child.id} element={child} level={level + 1} />
            ))}
        </>
    );
});

const LeftPanel = () => {
  const { state, addPage, deletePage, addAndLinkScript, selectPage, selectScript, selectElement, addGlobalStyle, selectGlobalStyle, requestConfirmation } = useProject();
  const [isAdding, setIsAdding] = useState<'Page' | 'Script' | 'Style' | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'navigator' | 'components'>('add');

  const activeProject = state.projects.find(p => p.id === state.activeProjectId);
  if (!activeProject) return null; // Should be handled by App.tsx router

  const currentPage = activeProject.pages.find(p => p.id === state.activePageId);

  const handleCreateNewItem = (name: string | null) => {
    if (name && isAdding) {
        if (isAdding === 'Page') addPage(name);
        else if (isAdding === 'Script') addAndLinkScript(name);
        else if (isAdding === 'Style') addGlobalStyle(name);
    }
    setIsAdding(null);
  };

  const handleDeletePage = (pageId: string, pageName: string) => {
    requestConfirmation(`Are you sure you want to delete ${pageName}?`, () => {
        deletePage(pageId);
    });
  };

  const handleDownload = async () => {
    const htmlFiles = activeProject.pages.map(page => ({
        name: page.name,
        content: generateHTML(page, activeProject)
    }));
    const jsFiles = activeProject.scripts.map(script => ({
        name: script.name,
        content: script.content
    }));
    const cssContent = generateCSS(activeProject);
    await zipAndDownloadProject(htmlFiles, jsFiles, cssContent);
  };

  return (
    <div className="w-72 bg-background-darker border-r border-border-color flex flex-col">
      <div className="p-4 border-b border-border-color space-y-4 overflow-y-auto">
        {/* Pages */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold">Pages</h3>
            <button onClick={() => setIsAdding('Page')} aria-label="Add new page" className="p-1 hover:bg-accent-green rounded transition-colors text-text-secondary hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          <div className="space-y-1">
            {activeProject.pages.map(page => (
              <div key={page.id} onClick={() => selectPage(page.id)}
                className={`p-1.5 rounded text-sm cursor-pointer flex justify-between items-center group ${state.activePageId === page.id ? 'bg-accent-blue text-white' : 'hover:bg-background-med'}`}>
                <span>📄 {page.name}</span>
                {activeProject.pages.length > 1 &&
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id, page.name); }}
                    aria-label={`Delete page ${page.name}`}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-accent-red transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                }
              </div>
            ))}
            {isAdding === 'Page' && <NewItemForm type="Page" onDone={handleCreateNewItem} placeholder="about.html" suffix=".html" />}
          </div>
        </section>

        {/* Scripts */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold">Scripts</h3>
            <button onClick={() => setIsAdding('Script')} aria-label="Add new script" disabled={!state.activePageId} className="p-1 hover:bg-accent-green rounded transition-colors text-text-secondary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
           <div className="space-y-1">
            {activeProject.scripts.map(script => (
              <div key={script.id} onClick={() => selectScript(script.id)}
                className={`p-1.5 rounded text-sm cursor-pointer ${state.activeScriptId === script.id ? 'bg-accent-blue text-white' : 'hover:bg-background-med'}`}>
                <span>📜 {script.name}</span>
              </div>
            ))}
            {isAdding === 'Script' && <NewItemForm type="Script" onDone={handleCreateNewItem} placeholder="main.js" suffix=".js" />}
          </div>
        </section>

        {/* Global Styles */}
         <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold">Global Styles</h3>
            <button onClick={() => setIsAdding('Style')} aria-label="Add new global style" className="p-1 hover:bg-accent-green rounded transition-colors text-text-secondary hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
           <div className="space-y-1">
            {activeProject.globalStyles.map(gs => (
              <div key={gs.selector} onClick={() => selectGlobalStyle(gs.selector)}
                className={`p-1.5 rounded text-sm cursor-pointer font-mono ${state.activeGlobalStyleSelector === gs.selector ? 'bg-accent-blue text-white' : 'hover:bg-background-med'}`}>
                <span>{gs.selector}</span>
              </div>
            ))}
            {isAdding === 'Style' && <NewItemForm type="Style" onDone={handleCreateNewItem} placeholder=".button" prefix="." />}
          </div>
        </section>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex border-b border-t border-border-color">
          <button onClick={() => setActiveTab('add')} className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}>Add</button>
          <button onClick={() => setActiveTab('navigator')} className={`tab-button ${activeTab === 'navigator' ? 'active' : ''}`}>Navigator</button>
          <button onClick={() => setActiveTab('components')} className={`tab-button ${activeTab === 'components' ? 'active' : ''}`}>Components</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'add' && (
            <div className="grid grid-cols-3 gap-2">
              {HTML5_SEMANTIC_TAGS.map(tag => ( <DraggableItem key={tag} type={ItemType.ELEMENT} item={{ tag }} name={tag} /> ))}
            </div>
          )}
          {activeTab === 'navigator' && currentPage && (
            <div role="tree" aria-label="Page Element Navigator">
              <ElementNode element={currentPage.rootElement} level={0} />
            </div>
          )}
          {activeTab === 'components' && (
             <div className="space-y-2">
               {activeProject.components.length === 0 && <p className="text-xs text-text-secondary text-center">No components saved yet. Select an element and click "Save as Component".</p>}
              {activeProject.components.map((comp: Component) => ( <DraggableItem key={comp.id} type={ItemType.COMPONENT} item={{ componentId: comp.id }} name={comp.name} /> ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 border-t border-border-color">
        <button onClick={handleDownload} className="w-full p-2 text-center bg-accent-indigo hover:bg-accent-indigo-hover text-white rounded font-semibold transition-colors">
          Download Project (.zip)
        </button>
      </div>
      <style>{`
        .w-72 { width: 18rem; } .flex-1 { flex: 1; } .min-h-0 { min-height: 0; }
        .bg-background-darker { background-color: var(--background-darker); } .bg-background-med { background-color: var(--background-med); }
        .border-r { border-right-width: 1px; } .border-b { border-bottom-width: 1px; } .border-t { border-top-width: 1px; } .border-border-color { border-color: var(--border-color); }
        .p-1 { padding: 0.25rem; } .p-1\\.5 { padding: 0.375rem; } .p-3 { padding: 0.75rem; } .p-4 { padding: 1rem; }
        .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; } .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
        .flex { display: flex; } .flex-col { flex-direction: column; } .justify-between { justify-content: space-between; } .items-center { align-items: center; }
        .text-base { font-size: 1rem; } .font-semibold { font-weight: 600; } .text-sm { font-size: 0.875rem; } .text-xs { font-size: 0.75rem; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .rounded { border-radius: 0.375rem; } .transition-colors { transition-property: background-color, border-color, color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .hover\\:bg-accent-green:hover { background-color: var(--accent-green); } .text-text-secondary { color: var(--text-secondary); } .hover\\:text-white:hover { color: white; }
        .cursor-pointer { cursor: pointer; } .bg-accent-blue { background-color: var(--accent-blue); } .text-white { color: white; }
        .hover\\:bg-background-med:hover { background-color: var(--background-med); } .disabled\\:opacity-50:disabled { opacity: 0.5; } .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
        .group:hover .group-hover\\:opacity-100 { opacity: 1; } .opacity-0 { opacity: 0; } .hover\\:bg-accent-red:hover { background-color: var(--accent-red); } .transition-opacity { transition-property: opacity; }
        .h-3 { height: 0.75rem; } .w-3 { width: 0.75rem; } .h-4 { height: 1rem; } .w-4 { width: 1rem; }
        .overflow-y-auto { overflow-y: auto; } .grid { display: grid; } .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } .gap-2 { gap: 0.5rem; }
        .w-full { width: 100%; } .text-center { text-align: center; } .bg-accent-indigo { background-color: var(--accent-indigo); } .hover\\:bg-accent-indigo-hover:hover { background-color: var(--accent-indigo-hover); }
        .tab-button { flex: 1; padding: 0.5rem; text-align: center; background-color: transparent; border: none; color: var(--text-secondary); font-weight: 500; cursor: pointer; transition: all 150ms; border-bottom: 2px solid transparent; }
        .tab-button.active { color: var(--accent-blue); border-bottom-color: var(--accent-blue); } .tab-button:hover { background-color: var(--background-med); }
      `}</style>
    </div>
  );
};

export default LeftPanel;