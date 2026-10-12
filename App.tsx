import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ProjectProvider } from './contexts/ProjectContext';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import StyleInjector from './components/StyleInjector';
import ErrorBoundary from './components/ErrorBoundary';
import ConfirmationDialog from './components/ConfirmationDialog';
import HomePage from './components/HomePage';
import { useProject } from './hooks/useProject';


function AppContent() {
  const { state, selectProject } = useProject();
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);

  return (
    <>
      <StyleInjector />
      <div className="bg-background-dark text-text-primary h-screen w-screen flex flex-col overflow-hidden">
        <header className="bg-background-darker border-b border-border-color p-3 text-center text-lg font-bold shadow-lg flex items-center justify-center space-x-2 relative">
          {activeProject && (
            <button onClick={() => selectProject(null)} aria-label="Back to projects dashboard" className="absolute left-4 p-1 hover:bg-background-med rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </button>
          )}
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            <span>Loaga</span>
            {activeProject && <span className="text-text-secondary font-normal">| {activeProject.name}</span>}
          </div>
        </header>
        <main className="flex flex-1 overflow-hidden">
          {activeProject ? (
            <>
              <LeftPanel />
              <CenterPanel />
              <RightPanel />
            </>
          ) : (
            <HomePage />
          )}
        </main>
      </div>
      <ConfirmationDialog />
      <style>{`
        /* Base Colors */
        :root {
          --background-darker: #0D1117;
          --background-dark: #161B22;
          --background-med: #21262D;
          --border-color: #30363D;
          --text-primary: #C9D1D9;
          --text-secondary: #8B949E;
          --accent-blue: #58A6FF;
          --accent-blue-hover: #79c0ff;
          --accent-green: #56d364;
          --accent-green-hover: #6eeb7f;
          --accent-purple: #a29bfe;
          --accent-purple-hover: #b1a9ff;
          --accent-red: #f85149;
          --accent-red-hover: #ff6b62;
          --accent-indigo: #818cf8;
          --accent-indigo-hover: #9fa8fc;
        }
        
        /* Utility Classes */
        .bg-background-darker { background-color: var(--background-darker); }
        .bg-background-dark { background-color: var(--background-dark); }
        .text-text-primary { color: var(--text-primary); }
        .h-screen { height: 100vh; }
        .w-screen { width: 100vw; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-1 { flex: 1 1 0%; }
        .overflow-hidden { overflow: hidden; }
        .border-b { border-bottom-width: 1px; }
        .border-r { border-right-width: 1px; }
        .border-l { border-left-width: 1px; }
        .border-border-color { border-color: var(--border-color); }
        .p-3 { padding: 0.75rem; }
        .text-center { text-align: center; }
        .text-lg { font-size: 1.125rem; }
        .font-bold { font-weight: 700; }
        .shadow-lg { box-shadow: 0 0 15px -3px rgb(0 0 0 / 0.3); }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.5rem; }
        .h-6 { height: 1.5rem; }
        .w-6 { width: 1.5rem; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .left-4 { left: 1rem; }
        .p-1 { padding: 0.25rem; }
        .hover\\:bg-background-med:hover { background-color: var(--background-med); }
        .rounded-full { border-radius: 9999px; }
        .transition-colors { transition-property: background-color, border-color, color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .text-text-secondary { color: var(--text-secondary); }
        .font-normal { font-weight: 400; }
      `}</style>
    </>
  );
}


function App() {
  return (
    <ProjectProvider>
      <DndProvider backend={HTML5Backend}>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </DndProvider>
    </ProjectProvider>
  );
}

export default App;
