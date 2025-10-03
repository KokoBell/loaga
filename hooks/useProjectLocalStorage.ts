import { useState, useEffect } from 'react';
import { AppState, Page, Element, Style, Component, GlobalStyle, Project } from '../types';
import { updateElementInTree, removeElementFromTree, insertElementInTree } from '../utils/elementUtils';

const LOCAL_STORAGE_KEY = 'react-site-builder-project';

const isLocalStorageAvailable = () => {
    try {
        const testKey = '__test_local_storage__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
};

export const createInitialState = (): AppState => {
    const now = Date.now();
    const initialRootElement: Element = {
        id: `root-${now}-1`,
        tag: 'body',
        attributes: {},
        styles: { backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif', minHeight: '100vh' },
        children: [],
        textContent: '',
    };
    const initialPage: Page = {
        id: `page-${now}-1`,
        name: 'index.html',
        rootElement: initialRootElement,
        scripts: [],
    };
    const initialProject: Project = {
        id: `proj-${now}-1`,
        name: 'My First Project',
        pages: [initialPage],
        scripts: [],
        components: [],
        globalStyles: [],
    };

    return {
        projects: [initialProject],
        activeProjectId: null,
        activePageId: null,
        activeScriptId: null,
        activeGlobalStyleSelector: null,
        selectedElementId: null,
        previewMode: false,
        isDragging: false,
        confirmationRequest: null,
    };
};

// Helper to deep clone an element and assign new unique IDs to it and all its children
const cloneAndReIdElement = (element: Element): Element => {
    const newElement: Element = {
        ...element,
        id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        children: element.children.map(cloneAndReIdElement)
    };
    return newElement;
};

export const useProjectLocalStorage = () => {
    const [state, setState] = useState<AppState>(() => {
        if (isLocalStorageAvailable()) {
            try {
                const storedItem = window.localStorage.getItem(LOCAL_STORAGE_KEY);
                if (storedItem) {
                    const parsed = JSON.parse(storedItem);
                    // Basic validation to ensure it's not completely broken state
                    if (parsed.projects && Array.isArray(parsed.projects)) {
                        return parsed;
                    }
                }
            } catch (error) {
                console.warn("Could not parse projects from localStorage. Using fresh state.", error);
            }
        }
        return createInitialState();
    });

    useEffect(() => {
        if (!isLocalStorageAvailable()) return;
        
        const handler = setTimeout(() => {
            try {
                window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
            } catch (error) {
                console.warn("Error writing to localStorage. Project may not be saved.", error);
            }
        }, 300);
        
        return () => clearTimeout(handler);
    }, [state]);
    
    // --- NEW PROJECT MANAGEMENT ---
    
    const createProject = (name: string) => {
        setState(s => {
            const now = Date.now();
            
            // Re-use the exact same structure from createInitialState to ensure consistency.
            const initialPageTemplate = createInitialState().projects[0].pages[0];

            const newRootElement = {
                ...initialPageTemplate.rootElement,
                id: `root-${now}`,
            };

            const newPage = {
                ...initialPageTemplate,
                id: `page-${now}`,
                rootElement: newRootElement,
            };

            const newProject: Project = {
                id: `proj-${now}`,
                name,
                pages: [newPage],
                scripts: [],
                components: [],
                globalStyles: [],
            };
            return { ...s, projects: [...s.projects, newProject] };
        });
    };

    const deleteProject = (projectId: string) => {
        setState(s => {
            const newProjects = s.projects.filter(p => p.id !== projectId);
            const newActiveProjectId = s.activeProjectId === projectId ? null : s.activeProjectId;
            return {
                ...s,
                projects: newProjects,
                activeProjectId: newActiveProjectId,
                activePageId: newActiveProjectId ? s.activePageId : null,
                selectedElementId: newActiveProjectId ? s.selectedElementId : null,
            };
        });
    };
    
    const selectProject = (projectId: string | null) => {
        setState(s => {
            const project = s.projects.find(p => p.id === projectId);
            if (!project) { // Deselecting or invalid ID
                 return { 
                     ...s, 
                     activeProjectId: null, 
                     activePageId: null, 
                     activeScriptId: null, 
                     activeGlobalStyleSelector: null, 
                     selectedElementId: null 
                };
            }
            const firstPage = project.pages[0];
            return {
                ...s,
                activeProjectId: projectId,
                activePageId: firstPage?.id || null,
                selectedElementId: firstPage?.rootElement.id || null,
                activeScriptId: null,
                activeGlobalStyleSelector: null,
            };
        });
    };

    // --- UTILITY TO UPDATE ACTIVE PROJECT ---
    const updateActiveProject = (updateFn: (project: Project) => Project) => {
        setState(s => {
            if (!s.activeProjectId) return s;
            const newProjects = s.projects.map(p => p.id === s.activeProjectId ? updateFn(p) : p);
            return { ...s, projects: newProjects };
        });
    };


    // --- GENERAL STATE MANAGEMENT (MOSTLY UNCHANGED) ---

    const setIsDragging = (isDragging: boolean) => setState(s => ({ ...s, isDragging }));
    const requestConfirmation = (message: string, onConfirm: () => void) => setState(s => ({ ...s, confirmationRequest: { message, onConfirm } }));
    const clearConfirmation = () => setState(s => ({ ...s, confirmationRequest: null }));
    const selectPage = (pageId: string | null) => setState(s => ({ ...s, activePageId: pageId, activeScriptId: null, activeGlobalStyleSelector: null, selectedElementId: s.projects.find(p=>p.id === s.activeProjectId)?.pages.find(pg=>pg.id===pageId)?.rootElement.id || null }));
    const selectScript = (scriptId: string | null) => setState(s => ({ ...s, activePageId: null, activeScriptId: scriptId, activeGlobalStyleSelector: null, selectedElementId: null }));
    const selectGlobalStyle = (selector: string | null) => setState(s => ({ ...s, activePageId: null, activeScriptId: null, activeGlobalStyleSelector: selector, selectedElementId: null }));
    const selectElement = (elementId: string | null) => setState(s => ({ ...s, selectedElementId: elementId }));
    const setPreviewMode = (enabled: boolean) => setState(s => ({ ...s, previewMode: enabled }));
    
    // --- REFACTORED PROJECT-SPECIFIC FUNCTIONS ---

    const addPage = (name: string) => {
        const now = Date.now();
        const newPage: Page = {
            id: `page-${now}`, name,
            rootElement: { ...createInitialState().projects[0].pages[0].rootElement, id: `root-${now}` },
            scripts: [],
        };
        updateActiveProject(proj => ({ ...proj, pages: [...proj.pages, newPage] }));
        setState(s => ({ ...s, activePageId: newPage.id, activeScriptId: null, activeGlobalStyleSelector: null, selectedElementId: newPage.rootElement.id }));
    };
    
    const deletePage = (pageId: string) => {
        let newActivePageId: string | null = null;
        let newSelectedElementId: string | null = null;

        updateActiveProject(proj => {
            if (proj.pages.length <= 1) return proj;
            const newPages = proj.pages.filter(p => p.id !== pageId);
            if (state.activePageId === pageId) {
                newActivePageId = newPages[0]?.id || null;
                newSelectedElementId = newPages[0]?.rootElement.id || null;
            }
            return { ...proj, pages: newPages };
        });
        
        if(newActivePageId) {
             setState(s => ({...s, activePageId: newActivePageId, selectedElementId: newSelectedElementId}));
        }
    };

    const addAndLinkScript = (name: string) => {
        const newScriptId = `script-${Date.now()}`;
        const newScript = { id: newScriptId, name, content: `console.log("Hello from ${name}");` };
        
        updateActiveProject(proj => {
            if (!state.activePageId) return { ...proj, scripts: [...proj.scripts, newScript] };
            const newPages = proj.pages.map(p => p.id === state.activePageId ? { ...p, scripts: [...p.scripts, newScriptId] } : p);
            return { ...proj, pages: newPages, scripts: [...proj.scripts, newScript] };
        });

        setState(s => ({ ...s, activePageId: null, activeScriptId: newScriptId, selectedElementId: null }));
    };
    
    const updateScript = (scriptId: string, content: string) => {
        updateActiveProject(proj => ({ ...proj, scripts: proj.scripts.map(sc => sc.id === scriptId ? { ...sc, content } : sc) }));
    };

    const addElement = (pageId: string, parentId: string, tag: string) => {
        const newElement: Element = {
            id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            tag, attributes: {}, styles: {}, children: [],
        };
        updateActiveProject(proj => ({
            ...proj, pages: proj.pages.map(p => p.id === pageId ? { ...p, rootElement: insertElementInTree(p.rootElement, parentId, p.rootElement.children.length, newElement) } : p)
        }));
    };
    
    const updateElementProperty = (pageId: string, elementId: string, updateFn: (element: Element) => Element) => {
        updateActiveProject(proj => ({
            ...proj,
            pages: proj.pages.map(page => {
                if (page.id !== pageId) return page;
                const newRoot = updateElementInTree(page.rootElement, elementId, updateFn);
                return { ...page, rootElement: newRoot };
            })
        }));
    };

    const updateElementStyle = (pageId: string, elementId: string, style: Style) => updateElementProperty(pageId, elementId, el => ({ ...el, styles: { ...el.styles, ...style } }));
    const updateElementClassNames = (pageId: string, elementId: string, classNames: string) => updateElementProperty(pageId, elementId, el => ({ ...el, classNames }));
    const updateElementAttribute = (pageId: string, elementId: string, attribute: string, value: string) => updateElementProperty(pageId, elementId, el => ({ ...el, attributes: { ...el.attributes, [attribute]: value } }));
    const updateElementText = (pageId: string, elementId: string, textContent: string) => updateElementProperty(pageId, elementId, el => ({ ...el, textContent }));
    
    const removeElementStyle = (pageId: string, elementId: string, property: string) => {
        updateElementProperty(pageId, elementId, el => {
            const newStyles = { ...el.styles };
            delete newStyles[property];
            return { ...el, styles: newStyles };
        });
    };
    
    const deleteElement = (pageId: string, elementId: string) => {
        let wasSelected = state.selectedElementId === elementId;
        updateActiveProject(proj => ({
            ...proj,
            pages: proj.pages.map(p => {
                if (p.id !== pageId || p.rootElement.id === elementId) return p;
                return { ...p, rootElement: removeElementFromTree(p.rootElement, elementId) };
            })
        }));
        if (wasSelected) {
            const page = state.projects.find(p=>p.id===state.activeProjectId)?.pages.find(p=>p.id===pageId);
            setState(s => ({ ...s, selectedElementId: page?.rootElement.id || null }));
        }
    };

    const moveElement = (pageId: string, elementId: string, newParentId: string, newIndex: number) => {
         updateActiveProject(proj => {
            const page = proj.pages.find(p => p.id === pageId);
            if (!page) return proj;

            let elementToMove: Element | null = null;
            const findAndReturn = (root: Element, id: string): Element | null => {
                if (root.id === id) return root;
                for (const child of root.children) { const found = findAndReturn(child, id); if (found) return found; } return null;
            };
            elementToMove = findAndReturn(page.rootElement, elementId);
            if (!elementToMove) return proj;

            const clonedElement = JSON.parse(JSON.stringify(elementToMove));
            const treeWithoutElement = removeElementFromTree(page.rootElement, elementId);
            const finalTree = insertElementInTree(treeWithoutElement, newParentId, newIndex, clonedElement);

            return { ...proj, pages: proj.pages.map(p => p.id === pageId ? { ...p, rootElement: finalTree } : p) };
         });
    };
    
    const saveElementAsComponent = (name: string) => {
        updateActiveProject(proj => {
            if (!state.activePageId || !state.selectedElementId) return proj;
            const page = proj.pages.find(p => p.id === state.activePageId);
            if (!page) return proj;
            
            const findElement = (root: Element, id: string): Element | null => {
                if (root.id === id) return root;
                for (const child of root.children) { const found = findElement(child, id); if (found) return found; } return null;
            };
            const elementToSave = findElement(page.rootElement, state.selectedElementId);
            if (!elementToSave) return proj;

            const newComponent: Component = {
                id: `comp-${Date.now()}`, name,
                rootElement: JSON.parse(JSON.stringify(elementToSave))
            };
            return { ...proj, components: [...proj.components, newComponent] };
        });
    };
    
    const addComponentInstance = (pageId: string, parentId: string, componentId: string) => {
        updateActiveProject(proj => {
            const component = proj.components.find(c => c.id === componentId);
            if (!component) return proj;
            
            const componentInstance = cloneAndReIdElement(component.rootElement);
            
            return {
                ...proj,
                pages: proj.pages.map(p => p.id === pageId ? { ...p, rootElement: updateElementInTree(p.rootElement, parentId, parent => ({ ...parent, children: [...parent.children, componentInstance] })) } : p)
            };
        });
    };
    
    const addGlobalStyle = (selector: string) => {
        updateActiveProject(proj => {
            if (proj.globalStyles.some(gs => gs.selector === selector) || !selector.trim()) return proj;
            const newGlobalStyle: GlobalStyle = { selector, styles: {} };
            return { ...proj, globalStyles: [...proj.globalStyles, newGlobalStyle] };
        });
        setState(s => ({ ...s, activeGlobalStyleSelector: selector, activePageId: null, activeScriptId: null }));
    };
    
    const updateGlobalStyle = (selector: string, newStyles: Style) => {
        updateActiveProject(proj => ({ ...proj, globalStyles: proj.globalStyles.map(gs => gs.selector === selector ? { ...gs, styles: { ...gs.styles, ...newStyles } } : gs) }));
    };
    
    const removeGlobalStyle = (selector: string) => {
        updateActiveProject(proj => ({ ...proj, globalStyles: proj.globalStyles.filter(gs => gs.selector !== selector) }));
        if (state.activeGlobalStyleSelector === selector) {
            setState(s => ({ ...s, activeGlobalStyleSelector: null }));
        }
    };

    const removeGlobalStyleProperty = (selector: string, property: string) => {
        updateActiveProject(proj => ({
            ...proj,
            globalStyles: proj.globalStyles.map(gs => {
                if (gs.selector === selector) {
                    const newStyles = { ...gs.styles };
                    delete newStyles[property];
                    return { ...gs, styles: newStyles };
                }
                return gs;
            })
        }));
    };

    return {
        state, createProject, deleteProject, selectProject,
        addPage, deletePage, addAndLinkScript, selectPage, selectScript, selectElement, setPreviewMode,
        updateScript, addElement, updateElementStyle, removeElementStyle, updateElementAttribute,
        updateElementText, deleteElement, moveElement, saveElementAsComponent, addComponentInstance,
        updateElementClassNames, addGlobalStyle, updateGlobalStyle, removeGlobalStyle, selectGlobalStyle,
        removeGlobalStyleProperty, setIsDragging, requestConfirmation, clearConfirmation,
    };
};

export type UseProjectLocalStorageReturn = ReturnType<typeof useProjectLocalStorage>;