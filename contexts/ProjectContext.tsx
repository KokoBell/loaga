import React, { createContext, ReactNode } from 'react';
import { useProjectLocalStorage, UseProjectLocalStorageReturn } from '../hooks/useProjectLocalStorage';
import { AppState } from '../types';

// The context will provide the state and all the updater functions from the hook.
export const ProjectContext = createContext<UseProjectLocalStorageReturn | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const projectStateAndUpdaters = useProjectLocalStorage();

  return (
    <ProjectContext.Provider value={projectStateAndUpdaters}>
      {children}
    </ProjectContext.Provider>
  );
};