import React, { useState } from 'react';
import { useProject } from '../hooks/useProject';
import { Style, GlobalStyle } from '../types';
import { CSS_PROPERTIES } from '../constants';

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
                        <button onClick={() => onStyleRemove(prop)} className="p-1.5 text-text-secondary hover:text-white hover:bg-accent-red rounded transition-colors">
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
                <button type="submit" className="p-1.5 text-text-secondary hover:text-white hover:bg-accent-green rounded transition-colors h-8 w-8 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
            </form>
        </div>
    );
};


const GlobalStylesEditor = () => {
    const { state, updateGlobalStyle, removeGlobalStyle, removeGlobalStyleProperty } = useProject();
    const { activeProjectId, activeGlobalStyleSelector } = state;

    const activeProject = state.projects.find(p => p.id === activeProjectId);
    const currentStyle = activeProject?.globalStyles.find((gs: GlobalStyle) => gs.selector === activeGlobalStyleSelector);

    if (!currentStyle) {
        return (
            <div className="p-4 flex items-center justify-center h-full text-text-secondary">
                <p>Select a global style from the Project Explorer to edit.</p>
            </div>
        );
    }

    const handleStyleChange = (style: Style) => {
        updateGlobalStyle(currentStyle.selector, style);
    };
    
    const handleStyleRemove = (prop: string) => {
        removeGlobalStyleProperty(currentStyle.selector, prop);
    };

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-color">
                <h2 className="text-xl font-bold">Editing: <code className="bg-background-med p-1 rounded">{currentStyle.selector}</code></h2>
                 <button onClick={() => removeGlobalStyle(currentStyle.selector)} className="px-2 py-1 text-xs bg-accent-red hover:bg-accent-red-hover rounded flex items-center space-x-1 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    <span>Delete Rule</span>
                </button>
            </div>
            <DynamicStyleEditor
                styles={currentStyle.styles}
                onStyleChange={handleStyleChange}
                onStyleRemove={handleStyleRemove}
            />
            <style>{`
                .max-w-2xl { max-width: 42rem; } .mx-auto { margin-left: auto; margin-right: auto; } .p-4 { padding: 1rem; }
                .md\\:p-8 { padding: 2rem; } .h-full { height: 100%; } .text-xl { font-size: 1.25rem; } .font-bold { font-weight: 700; }
                .mb-4 { margin-bottom: 1rem; } .pb-2 { padding-bottom: 0.5rem; } .border-b { border-bottom-width: 1px; }
                .border-border-color { border-color: var(--border-color); } .bg-background-med { background-color: var(--background-med); }
                .p-1 { padding: 0.25rem; } .rounded { border-radius: 0.375rem; }
                .flex-1 { flex: 1; } .flex { display: flex; } .items-center { align-items: center; } .items-end { align-items: flex-end; }
                .justify-center { justify-content: center; } .justify-between { justify-content: space-between; }
                .text-text-secondary { color: var(--text-secondary); } .space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.5rem; }
                .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
                .w-full { width: 100%; } .h-8 { height: 2rem; } .w-8 { width: 2rem; } .flex-shrink-0 { flex-shrink: 0; }
                .h-4 { height: 1rem; } .w-4 { width: 1rem; } .h-3 { height: 0.75rem; } .w-3 { width: 1rem; } .m-auto { margin: auto; }
                .bg-accent-red { background-color: var(--accent-red); } .hover\\:bg-accent-red-hover:hover { background-color: var(--accent-red-hover); }
            `}</style>
        </div>
    );
};

export default GlobalStylesEditor;