import React from 'react';
import { useProject } from '../hooks/useProject';
import Canvas from './Canvas';
import CodeEditor from './CodeEditor';
import { Page, Script, GlobalStyle } from '../types';
import { generateHTML } from '../utils/codeGenerator';
import GlobalStylesEditor from './GlobalStylesEditor';

const CenterPanel = () => {
    const { state, setPreviewMode } = useProject();
    const { activeProjectId, activePageId, activeScriptId, activeGlobalStyleSelector, previewMode } = state;

    const activeProject = state.projects.find(p => p.id === activeProjectId);
    if (!activeProject) return null;

    const currentPage = activeProject.pages.find((p: Page) => p.id === activePageId);
    const currentScript = activeProject.scripts.find((s: Script) => s.id === activeScriptId);
    const currentGlobalStyle = activeProject.globalStyles.find((gs: GlobalStyle) => gs.selector === activeGlobalStyleSelector);

    const selectedItemName = currentPage?.name || currentScript?.name || currentGlobalStyle?.selector || 'Nothing Selected';

    const isPage = !!currentPage;
    const isScript = !!currentScript;
    const isGlobalStyle = !!currentGlobalStyle;
    
    const page = isPage ? currentPage : null;
    const finalHtml = page ? generateHTML(page, activeProject) : '';

    return (
        <div className="flex-1 flex flex-col bg-background-dark">
            <div className="flex-shrink-0 bg-background-darker border-b border-border-color p-2 flex justify-between items-center">
                <span className="font-semibold text-text-secondary">{selectedItemName}</span>
                {isPage && (
                     <button 
                        onClick={() => setPreviewMode(!previewMode)} 
                        aria-label={previewMode ? "Switch to Designer mode" : "Switch to Preview mode"}
                        className="px-3 py-1 text-sm bg-accent-purple hover:bg-accent-purple-hover rounded flex items-center space-x-2">
                        {previewMode 
                          ? <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg><span>Designer</span></>
                          : <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg><span>Preview</span></>
                        }
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-auto">
                {isPage && !previewMode && <Canvas key={currentPage.id} />}
                {isPage && previewMode && <iframe srcDoc={finalHtml} title="preview" className="w-full h-full border-0" sandbox="allow-scripts" />}
                {isScript && <CodeEditor />}
                {isGlobalStyle && <GlobalStylesEditor />}
                {!isPage && !isScript && !isGlobalStyle && (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary">
                    <p>Select an item from the Project Explorer to get started.</p>
                  </div>
                )}
            </div>
            <style>{`
                .flex-1 { flex: 1; } .flex { display: flex; } .flex-col { flex-direction: column; } .flex-shrink-0 { flex-shrink: 0; }
                .bg-background-darker { background-color: var(--background-darker); } .bg-background-dark { background-color: var(--background-dark); }
                .bg-accent-purple { background-color: var(--accent-purple); } .hover\\:bg-accent-purple-hover:hover { background-color: var(--accent-purple-hover); }
                .border-0 { border-width: 0; } .border-b { border-bottom-width: 1px; } .border-border-color { border-color: var(--border-color); }
                .p-2 { padding: 0.5rem; } .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; } .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                .text-sm { font-size: 0.875rem; } .font-semibold { font-weight: 600; } .text-text-secondary { color: var(--text-secondary); }
                .justify-between { justify-content: space-between; } .justify-center { justify-content: center; } .items-center { align-items: center; }
                .w-full { width: 100%; } .h-full { height: 100%; } .overflow-auto { overflow: auto; } .rounded { border-radius: 0.375rem; }
                .space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.5rem; } .h-4 { height: 1rem; } .w-4 { width: 1rem; }
            `}</style>
        </div>
    );
};

export default CenterPanel;