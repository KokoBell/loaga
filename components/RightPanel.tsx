import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../hooks/useProject';
import { Element, Page, Style } from '../types';
import { CSS_PROPERTIES } from '../constants';

const findElementById = (root: Element, id: string): Element | null => {
    if (root.id === id) return root;
    for (const child of root.children) {
        const found = findElementById(child, id);
        if (found) return found;
    }
    return null;
};

const FlexboxEditor = ({ styles, onStyleChange }: { styles: Style, onStyleChange: (style: Style) => void }) => {
    const flexProps = {
        flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'],
        justifyContent: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
        alignItems: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
    };

    return (
        <div className="p-2 border border-border-color rounded bg-background-dark space-y-2">
            <h4 className="text-xs font-bold text-text-secondary">Flexbox Controls</h4>
            {Object.entries(flexProps).map(([prop, values]) => (
                <div key={prop}>
                    <label className="text-xs text-text-secondary capitalize mb-1 block">{prop.replace(/([A-Z])/g, ' $1')}</label>
                    <select
                        value={styles[prop] || ''}
                        onChange={e => onStyleChange({ [prop]: e.target.value })}
                        className="w-full p-1 bg-background-med border border-border-color rounded text-sm"
                    >
                        <option value="">-- default --</option>
                        {values.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            ))}
        </div>
    );
};

const DynamicStyleEditor = ({ styles, onStyleChange, onStyleRemove }: { styles: Style, onStyleChange: (style: Style) => void, onStyleRemove: (prop: string) => void }) => {
    const [newProp, setNewProp] = useState('');
    const [newValue, setNewValue] = useState('');

    const handleAddStyle = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProp && newValue) {
            const camelCaseProp = newProp.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            onStyleChange({ [camelCaseProp]: newValue });
            setNewProp('');
 setNewValue('');
        }
    };
    
    const isFlex = styles.display === 'flex';

    return (
        <div className="space-y-3">
            {isFlex && <FlexboxEditor styles={styles} onStyleChange={onStyleChange} />}
            {Object.entries(styles).map(([prop, value]) => (
                <div key={prop} className="style-property-item">
                    <label className="text-xs text-text-secondary capitalize mb-1 block">{prop}</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type={prop.toLowerCase().includes('color') ? 'color' : 'text'}
                            value={value}
                            onChange={e => onStyleChange({ [prop]: e.target.value })}
                            className="flex-1 p-1 bg-background-med border border-border-color rounded text-sm"
                        />
                        <button onClick={() => onStyleRemove(prop)} aria-label={`Remove style ${prop}`} className="p-1.5 text-text-secondary hover:text-white hover:bg-accent-red rounded transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            ))}
            <form onSubmit={handleAddStyle} className="flex items-end space-x-2 pt-3 border-t border-border-color">
                <div className="flex-1">
                    <label className="text-xs text-text-secondary block mb-1">Property</label>
                    <input type="text" list="css-props" value={newProp} onChange={e => setNewProp(e.target.value)} placeholder="e.g. fontSize" className="w-full p-1 bg-background-med border border-border-color rounded text-sm" />
                    <datalist id="css-props">{CSS_PROPERTIES.map(p => <option key={p} value={p} />)}</datalist>
                </div>
                 <div className="flex-1">
                    <label className="text-xs text-text-secondary block mb-1">Value</label>
                    <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="e.g. 16px" className="w-full p-1 bg-background-med border border-border-color rounded text-sm" />
                </div>
                <button type="submit" aria-label="Add new style property" className="p-1.5 text-text-secondary hover:text-white hover:bg-accent-green rounded transition-colors h-8 w-8 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
            </form>
        </div>
    );
};

const AttributeEditor = ({ pageId, element }: { pageId: string, element: Element }) => {
    const { updateElementAttribute } = useProject();
    const applicableAttrs: {[key: string]: string[]} = {
        'img': ['src', 'alt'], 'a': ['href', 'target'], 'input': ['type', 'placeholder', 'value'],
        'form': ['action', 'method'], 'label': ['for']
    };
    return (<div className="space-y-2">{(applicableAttrs[element.tag] || []).map(attr => (<div key={attr}><label className="text-xs text-text-secondary capitalize mb-1 block">{attr}</label><input type="text" value={element.attributes[attr] || ''} onChange={e => updateElementAttribute(pageId, element.id, attr, e.target.value)} className="w-full p-1 bg-background-med border border-border-color rounded text-sm"/></div>))}</div>);
};

const ContentEditor = ({ pageId, element }: { pageId: string, element: Element }) => {
    const { updateElementText } = useProject();
    if (element.children.length > 0) return <p className="text-xs text-text-secondary italic px-1">Content can only be added to elements without children.</p>;
    return (<textarea value={element.textContent || ''} onChange={e => updateElementText(pageId, element.id, e.target.value)} className="w-full p-1 bg-background-med border border-border-color rounded h-24 text-sm" placeholder="Enter text content..." />);
}

const RightPanel = () => {
    const { state, deleteElement, saveElementAsComponent, updateElementStyle, removeElementStyle, updateElementClassNames } = useProject();
    const { activeProjectId, activePageId, selectedElementId } = state;
    const [isSavingComponent, setIsSavingComponent] = useState(false);
    const [newComponentName, setNewComponentName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const activeProject = state.projects.find(p => p.id === activeProjectId);
    if (!activeProject) return null;

    const currentPage = activeProject.pages.find((p: Page) => p.id === activePageId);
    const selectedElement = currentPage && selectedElementId ? findElementById(currentPage.rootElement, selectedElementId) : null;
    
    useEffect(() => {
        if (isSavingComponent) {
            inputRef.current?.focus();
        }
    }, [isSavingComponent]);

    const handleSaveComponent = () => {
        if (selectedElement) {
            const defaultName = `${selectedElement.tag}-${Math.random().toString(36).substring(2, 6)}`;
            setNewComponentName(defaultName);
            setIsSavingComponent(true);
        }
    };
    
    const handleConfirmSaveComponent = (e: React.FormEvent) => {
      e.preventDefault();
      if (newComponentName.trim() && selectedElement) {
        saveElementAsComponent(newComponentName.trim());
      }
      setIsSavingComponent(false);
      setNewComponentName('');
    }

    const handleCancelSaveComponent = () => {
      setIsSavingComponent(false);
      setNewComponentName('');
    }

    if (!selectedElement || !currentPage) {
        return (<div className="w-72 bg-background-darker border-l border-border-color p-4 flex items-center justify-center"><p className="text-text-secondary text-center">No element selected.</p></div>);
    }

    return (
        <div className="w-72 bg-background-darker border-l border-border-color flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-border-color">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-lg font-bold">Properties</h2>
                    {!selectedElement.id.startsWith('root') && (
                         <button onClick={() => deleteElement(currentPage.id, selectedElement.id)} aria-label="Delete selected element" className="px-2 py-1 text-xs bg-accent-red hover:bg-accent-red-hover rounded flex items-center space-x-1 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           <span>Delete</span>
                         </button>
                    )}
                </div>
                <p className="text-sm text-text-secondary">Tag: &lt;{selectedElement.tag}&gt;</p>
            </div>
            <div className="p-4 space-y-2">
                {!selectedElement.id.startsWith('root') && !isSavingComponent &&
                <button onClick={handleSaveComponent} className="w-full mb-2 p-2 text-sm bg-accent-indigo hover:bg-accent-indigo-hover rounded flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    <span>Save as Component</span>
                </button>}
                {isSavingComponent && (
                    <form onSubmit={handleConfirmSaveComponent} className="mb-2 p-2 border border-border-color rounded bg-background-dark space-y-2">
                      <label htmlFor="componentName" className="text-sm font-semibold text-text-primary block">Component Name</label>
                      <input
                        ref={inputRef}
                        id="componentName"
                        type="text"
                        value={newComponentName}
                        onChange={e => setNewComponentName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Escape') handleCancelSaveComponent(); }}
                        className="w-full p-1 bg-background-med border border-border-color rounded text-sm"
                      />
                      <div className="flex justify-end space-x-2 pt-1">
                          <button type="button" onClick={handleCancelSaveComponent} className="px-3 py-1 text-xs font-semibold text-text-primary bg-background-med hover:bg-border-color rounded transition-colors">Cancel</button>
                          <button type="submit" className="px-3 py-1 text-xs font-semibold text-white bg-accent-green hover:bg-accent-green-hover rounded transition-colors">Save</button>
                      </div>
                    </form>
                )}
                <details className="details-section" open><summary className="font-semibold text-base cursor-pointer py-1">Content</summary><div className="pt-2"><ContentEditor pageId={currentPage.id} element={selectedElement} /></div></details>
                <details className="details-section" open><summary className="font-semibold text-base cursor-pointer py-1">Classes</summary><div className="pt-2"><textarea value={selectedElement.classNames || ''} onChange={e => updateElementClassNames(currentPage.id, selectedElement.id, e.target.value)} className="w-full p-1 bg-background-med border border-border-color rounded h-16 text-sm" placeholder="e.g. card button-primary"/></div></details>
                <details className="details-section" open><summary className="font-semibold text-base cursor-pointer py-1">Attributes</summary><div className="pt-2"><AttributeEditor pageId={currentPage.id} element={selectedElement} /></div></details>
                <details className="details-section" open><summary className="font-semibold text-base cursor-pointer py-1">Styles</summary><div className="pt-2"><DynamicStyleEditor styles={selectedElement.styles} onStyleChange={(style) => updateElementStyle(currentPage.id, selectedElement.id, style)} onStyleRemove={(prop) => removeElementStyle(currentPage.id, selectedElement.id, prop)} /></div></details>
            </div>
            <style>{`
            .w-72 { width: 18rem; } .w-full { width: 100%; } .h-24 { height: 6rem; } .h-16 { height: 4rem; }
            .h-8 { height: 2rem; } .w-8 { width: 2rem; } .h-4 { height: 1rem; } .w-4 { width: 1rem; } .h-3 { height: 0.75rem; } .w-3 { width: 0.75rem; }
            .m-auto { margin: auto; } .flex-1 { flex: 1; } .flex-shrink-0 { flex-shrink: 0; }
            .bg-background-dark { background-color: var(--background-dark); } .bg-background-med { background-color: var(--background-med); }
            .bg-accent-red { background-color: var(--accent-red); } .hover\\:bg-accent-red-hover:hover { background-color: var(--accent-red-hover); }
            .bg-accent-indigo { background-color: var(--accent-indigo); } .hover\\:bg-accent-indigo-hover:hover { background-color: var(--accent-indigo-hover); }
            .bg-accent-green { background-color: var(--accent-green); } .hover\\:bg-accent-green-hover:hover { background-color: var(--accent-green-hover); }
            .border { border-width: 1px; } .border-l { border-left-width: 1px; } .border-b { border-bottom-width: 1px; } .border-t { border-top-width: 1px; } .border-border-color { border-color: var(--border-color); }
            .rounded { border-radius: 0.375rem; } .p-1 { padding: 0.25rem; } .p-1\\.5 { padding: 0.375rem; } .p-2 { padding: 0.5rem; } .p-4 { padding: 1rem; }
            .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; } .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; } .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; } .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .pt-1 { padding-top: 0.25rem; } .pt-2 { padding-top: 0.5rem; } .pt-3 { padding-top: 0.75rem; } .mb-1 { margin-bottom: 0.25rem; } .mb-2 { margin-bottom: 0.5rem; } .capitalize { text-transform: capitalize; }
            .text-sm { font-size: 0.875rem; } .text-xs { font-size: 0.75rem; } .text-base { font-size: 1rem; }
            .text-text-secondary { color: var(--text-secondary); } .text-text-primary { color: var(--text-primary); } .font-semibold { font-weight: 600; } .italic { font-style: italic; }
            .block { display: block; } .items-center { align-items: center; } .items-end { align-items: flex-end; }
            .justify-between { justify-content: space-between; } .justify-center { justify-content: center; } .justify-end { justify-content: flex-end; }
            .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; } .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
            .space-x-1 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.25rem; } .space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.5rem; }
            .cursor-pointer { cursor: pointer; } .transition-colors { transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1); }
            .hover\\:text-white:hover { color: white; } .hover\\:bg-border-color:hover { background-color: var(--border-color); }
            .details-section { border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; } .details-section:last-of-type { border-bottom: none; }
            .details-section summary { list-style: none; } .details-section summary::-webkit-details-marker { display: none; }
            .details-section summary::before { content: '▶'; display: inline-block; margin-right: 0.5rem; transition: transform 0.2s; font-size: 0.8em; }
            .details-section[open] > summary::before { transform: rotate(90deg); }
            `}</style>
        </div>
    );
};

export default RightPanel;