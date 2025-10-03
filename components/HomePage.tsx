import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProject } from '../hooks/useProject';

const StatCard = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-background-dark p-4 rounded-lg flex items-center space-x-4 border border-border-color">
        <div className="bg-background-med p-3 rounded-full">
            {icon}
        </div>
        <div>
            <div className="text-2xl font-bold text-text-primary">{value}</div>
            <div className="text-sm text-text-secondary">{label}</div>
        </div>
    </div>
);


const HomePage = () => {
    const { state, createProject, deleteProject, selectProject, requestConfirmation } = useProject();
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const newProjectInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isCreating) {
            newProjectInputRef.current?.focus();
        }
    }, [isCreating]);

    const globalStats = useMemo(() => {
        const totalProjects = state.projects.length;
        const totalPages = state.projects.reduce((sum, p) => sum + p.pages.length, 0);
        const totalComponents = state.projects.reduce((sum, p) => sum + p.components.length, 0);
        return { totalProjects, totalPages, totalComponents };
    }, [state.projects]);

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProjectName.trim()) {
            createProject(newProjectName.trim());
            setNewProjectName('');
            setIsCreating(false);
        }
    };
    
    const handleDeleteProject = (e: React.MouseEvent, projectId: string, projectName: string) => {
        e.stopPropagation(); // Prevent the card's onClick from firing
        requestConfirmation(`Are you sure you want to permanently delete "${projectName}"? This action cannot be undone.`, () => {
            deleteProject(projectId);
        });
    };

    return (
        <div className="w-full h-full bg-background-darker overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">My Projects</h1>
                    <p className="text-text-secondary mt-1">Welcome back! Manage your projects or start a new one.</p>
                </header>

                <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                     <StatCard label="Total Projects" value={globalStats.totalProjects} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>} />
                     <StatCard label="Total Pages" value={globalStats.totalPages} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>} />
                     <StatCard label="Total Components" value={globalStats.totalComponents} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
                </section>

                <h2 className="text-2xl font-semibold text-text-primary mb-6">All Projects</h2>
                
                 {state.projects.length === 0 && !isCreating && (
                    <div className="text-center py-16">
                         <button onClick={() => setIsCreating(true)} className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border-color rounded-lg text-text-secondary hover:bg-background-dark hover:border-accent-blue transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            <span className="text-xl font-semibold text-text-primary">Create Your First Project</span>
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {state.projects.map(project => (
                        <div
                            key={project.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => selectProject(project.id)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectProject(project.id) }}
                            className="project-card-container group"
                        >
                            <button 
                                onClick={(e) => handleDeleteProject(e, project.id, project.name)} 
                                aria-label={`Delete project ${project.name}`}
                                className="delete-button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-text-primary mb-2">{project.name}</h3>
                                <div className="text-sm text-text-secondary space-y-1">
                                    <p>Pages: {project.pages.length}</p>
                                    <p>Components: {project.components.length}</p>
                                    <p>Scripts: {project.scripts.length}</p>
                                </div>
                            </div>
                            <div className="card-footer">
                                <span>Open Project &rarr;</span>
                            </div>
                        </div>
                    ))}
                    
                    {isCreating ? (
                        <form onSubmit={handleCreateProject} className="bg-background-dark p-4 rounded-lg border border-accent-blue flex flex-col space-y-4">
                            <label htmlFor="new-project-name" className="text-sm font-semibold text-text-primary">New Project Name</label>
                            <input
                                ref={newProjectInputRef}
                                id="new-project-name"
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Escape') setIsCreating(false); }}
                                placeholder="e.g., My Portfolio"
                                className="w-full p-2 bg-background-med border border-border-color rounded-md text-sm text-black placeholder-text-secondary transition-colors focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                            />
                             <div className="flex justify-end space-x-2 pt-2">
                                 <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-background-med rounded-md transition-colors">Cancel</button>
                                 <button type="submit" disabled={!newProjectName.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-accent-green hover:bg-accent-green-hover rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Create Project</button>
                             </div>
                        </form>
                    ) : ( state.projects.length > 0 &&
                        <button onClick={() => setIsCreating(true)} className="flex flex-col items-center justify-center w-full h-full min-h-[170px] border-2 border-dashed border-border-color rounded-lg text-text-secondary hover:bg-background-dark hover:border-accent-blue transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            <span className="font-semibold text-text-primary">Create New Project</span>
                        </button>
                    )}
                </div>
            </div>
             <style>{`
                .project-card-container {
                    position: relative;
                    background-color: var(--background-dark);
                    border-radius: 0.5rem;
                    padding: 1.25rem;
                    border: 1px solid var(--border-color);
                    transition: all 0.2s ease-in-out;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .project-card-container:hover, .project-card-container:focus-within {
                    border-color: var(--accent-blue);
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px -5px rgba(0,0,0,0.2);
                }
                .delete-button {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    padding: 0.375rem;
                    background-color: var(--background-med);
                    color: var(--text-secondary);
                    border-radius: 9999px;
                    opacity: 0;
                    transform: scale(0.8);
                    transition: opacity 0.2s, transform 0.2s;
                }
                .group:hover .delete-button, .group:focus-within .delete-button {
                    opacity: 1;
                    transform: scale(1);
                }
                .delete-button:hover, .delete-button:focus {
                    background-color: var(--accent-red);
                    color: white;
                }
                .card-footer {
                    margin-top: 1.5rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    font-weight: 500;
                    font-size: 0.875rem;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .group:hover .card-footer, .group:focus-within .card-footer {
                    opacity: 1;
                }

                /* General Styles (scoped to component) */
                .w-full { width: 100%; } .h-full { height: 100%; } .max-w-7xl { max-width: 80rem; } .mx-auto { margin-left: auto; margin-right: auto; }
                .p-2 { padding: 0.5rem; } .p-4 { padding: 1rem; } .sm\\:p-6 { padding: 1.5rem; } .lg\\:p-8 { padding: 2rem; } .pt-2 { padding-top: 0.5rem; }
                .px-4 { padding-left: 1rem; padding-right: 1rem; } .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                .mb-8 { margin-bottom: 2rem; } .mb-6 { margin-bottom: 1.5rem; } .mb-2 { margin-bottom: 0.5rem; } .mt-1 { margin-top: 0.25rem; }
                .text-3xl { font-size: 1.875rem; } .text-2xl { font-size: 1.5rem; } .text-xl { font-size: 1.25rem; } .text-lg { font-size: 1.125rem; } .text-sm { font-size: 0.875rem; }
                .font-bold { font-weight: 700; } .font-semibold { font-weight: 600; }
                .grid { display: grid; } .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
                .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } .gap-4 { gap: 1rem; } .gap-6 { gap: 1.5rem; }
                .flex { display: flex; } .flex-col { flex-direction: column; } .flex-grow { flex-grow: 1; } .items-center { align-items: center; } .justify-between { justify-content: space-between; } .justify-end { justify-content: flex-end; } .justify-center { justify-content: center; }
                .space-x-2 > * + * { margin-left: 0.5rem; } .space-x-4 > * + * { margin-left: 1rem; }
                .space-y-1 > * + * { margin-top: 0.25rem; } .space-y-4 > * + * { margin-top: 1rem; }
                .rounded-lg { border-radius: 0.5rem; } .rounded-full { border-radius: 9999px; } .rounded-md { border-radius: 0.375rem; }
                .border { border-width: 1px; } .border-2 { border-width: 2px; } .border-dashed { border-style: dashed; }
                .transition-colors { transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out; }
                .min-h-\\[170px\\] { min-height: 170px; } .h-8 { height: 2rem; } .w-8 { width: 2rem; } .h-6 { height: 1.5rem; } .w-6 { width: 1.5rem; }
                .h-4 { height: 1rem; } .w-4 { width: 1rem; } .h-10 { height: 2.5rem; } .w-10 { width: 2.5rem; }
                .text-text-primary { color: var(--text-primary); } .text-text-secondary { color: var(--text-secondary); }
                .text-black { color: #0D1117; }
                .placeholder-text-secondary::placeholder { color: var(--text-secondary); }
                .focus\\:border-accent-blue:focus { border-color: var(--accent-blue); }
                .focus\\:outline-none:focus { outline: none; }
                .focus\\:ring-2:focus { box-shadow: 0 0 0 2px var(--tw-ring-color); }
                .focus\\:ring-accent-blue\\/50:focus { --tw-ring-color: rgba(88, 166, 255, 0.5); }
                .disabled\\:opacity-50:disabled { opacity: 0.5; }
                .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
                .hover\\:text-text-primary:hover { color: var(--text-primary); }
                .hover\\:bg-background-med:hover { background-color: var(--background-med); }
                .text-white { color: #fff; }
                .bg-accent-green { background-color: var(--accent-green); }
                .hover\\:bg-accent-green-hover:hover { background-color: var(--accent-green-hover); }
            `}</style>
        </div>
    );
};

export default HomePage;