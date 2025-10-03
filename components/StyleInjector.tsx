import React, { useEffect, useMemo } from 'react';
import { useProject } from '../hooks/useProject';
import { generateCSS } from '../utils/codeGenerator';

const STYLE_ID = 'dynamic-builder-styles';

const StyleInjector = () => {
  const { state } = useProject();
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);

  const cssString = useMemo(() => {
    if (!activeProject) return '';
    return generateCSS(activeProject);
  }, [activeProject]);

  useEffect(() => {
    let styleTag = document.getElementById(STYLE_ID);

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = STYLE_ID;
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = cssString;

  }, [cssString]);

  return null;
};

export default StyleInjector;