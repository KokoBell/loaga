import React, { useState, useEffect } from 'react';
import { useProject } from '../hooks/useProject';
import { Script } from '../types';
import Editor from 'react-simple-code-editor';

const CodeEditor = () => {
    const { state, updateScript } = useProject();
    const { activeProjectId, activeScriptId } = state;

    const activeProject = state.projects.find(p => p.id === activeProjectId);
    const script = activeProject?.scripts.find((s: Script) => s.id === activeScriptId);

    const [code, setCode] = useState(script?.content || '');

    useEffect(() => {
        setCode(script?.content || '');
    }, [script]);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            if (script && code !== script.content) {
                updateScript(script.id, code);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [code, script, updateScript]);

    if (!script) {
        return <div className="p-4 text-text-secondary">Select a script to edit.</div>;
    }

    const highlight = (code: string) => {
        const Prism = (window as any).Prism;
        if (Prism && Prism.languages.javascript) {
           return Prism.highlight(code, Prism.languages.javascript, 'javascript');
        }
        return code;
    };

    return (
        <div className="h-full w-full bg-[#272822] text-white">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={highlight}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 14,
              outline: 'none',
              border: 'none',
              backgroundColor: '#272822',
              color: '#f8f822',
              height: '100%'
            }}
          />
        </div>
    );
};

export default CodeEditor;