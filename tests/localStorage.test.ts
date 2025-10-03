import { AppState, Element } from '../types';
import { describe, it, expect, beforeEach, afterAll } from './testRunner';
import { useProjectLocalStorage, UseProjectLocalStorageReturn, createInitialState } from '../hooks/useProjectLocalStorage';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { flushSync } from 'react-dom';

const LOCAL_STORAGE_KEY = 'react-site-builder-project';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem(key: string) { return store[key] || null; },
    setItem(key: string, value: string) { store[key] = value.toString(); },
    clear() { store = {}; },
    removeItem(key: string) { delete store[key]; }
  };
})();

export const runLocalStorageTests = () => {

  describe('LocalStorage State Management (Multi-Project)', () => {
    let updaters: UseProjectLocalStorageReturn;
    const container = document.createElement('div');
    const root = ReactDOM.createRoot(container);
    let testKey = 0;

    let originalLocalStorage: Storage | null = null;
    let didBackup = false;
    try {
      originalLocalStorage = window.localStorage;
      didBackup = true;
    } catch (e) {
      console.warn("Could not access window.localStorage to back it up before tests.", e);
    }

    // Always try to set the mock so tests can run against a predictable, in-memory store.
    try {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });
    } catch (e) {
      console.error("Fatal: Could not mock window.localStorage. Tests dependent on it will likely fail.", e);
    }

    afterAll(() => {
      // Only restore localStorage if we successfully backed it up.
      if (didBackup && originalLocalStorage) {
        try {
          Object.defineProperty(window, 'localStorage', { value: originalLocalStorage, configurable: true });
        } catch (e) {
          console.warn("Could not restore original localStorage after tests.", e);
        }
      }
    });

    const TestComponent = () => {
      updaters = useProjectLocalStorage();
      return null;
    };

    beforeEach(() => {
      testKey++;
      flushSync(() => { root.render(null); });
      localStorageMock.clear();
      localStorageMock.setItem(LOCAL_STORAGE_KEY, JSON.stringify(createInitialState()));
      flushSync(() => { root.render(React.createElement(TestComponent, { key: testKey })); });
    });

    const getStoredState = (): AppState | null => {
      const item = localStorageMock.getItem(LOCAL_STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    };

    it('should initialize state from localStorage', () => {
      expect(updaters.state).toEqual(createInitialState());
    });

    // --- Project Management Tests ---
    it('Project Management: should create a new project', async () => {
      flushSync(() => updaters.createProject('My Second Site'));
      await sleep(350);
      const state = getStoredState()!;
      expect(state.projects.length).toBe(2);
      expect(state.projects[1].name).toBe('My Second Site');
    });

    it('Project Management: should select a project and set its first page as active', async () => {
      const initialProjectId = getStoredState()!.projects[0].id;
      flushSync(() => updaters.selectProject(initialProjectId));
      await sleep(350);
      const state = getStoredState()!;
      expect(state.activeProjectId).toBe(initialProjectId);
      expect(state.activePageId).toBe(state.projects[0].pages[0].id);
    });
    
    it('Project Management: should delete a project after confirmation', async () => {
      // Setup: Create a project to delete
      flushSync(() => updaters.createProject('To Be Deleted'));
      await sleep(350);
      const projectToDelete = updaters.state.projects[1];
      expect(projectToDelete).toBeDefined();

      // Action: Request deletion, which sets up the confirmation state
      flushSync(() => {
        updaters.requestConfirmation(
          `Delete ${projectToDelete.name}?`,
          () => { updaters.deleteProject(projectToDelete.id); }
        );
      });

      // Pre-condition Assert: Check if the confirmation is requested
      expect(updaters.state.confirmationRequest).not.toBeNull();
      expect(updaters.state.confirmationRequest!.message).toBe(`Delete ${projectToDelete.name}?`);

      // Action: Simulate the user clicking "Confirm"
      flushSync(() => {
        // The dialog would call onConfirm, then clearConfirmation
        updaters.state.confirmationRequest!.onConfirm();
        updaters.clearConfirmation();
      });
      await sleep(350);

      // Post-condition Assert: Check if project is deleted and confirmation is cleared
      const finalState = getStoredState()!;
      expect(finalState.projects.length).toBe(1);
      expect(finalState.projects.find(p => p.id === projectToDelete.id)).toBe(undefined);
      expect(finalState.confirmationRequest).toBeNull();
    });

    // --- Page and Element Management (in active project) ---
    it('Page Management: should add a page to the active project', async () => {
      const projectId = getStoredState()!.projects[0].id;
      flushSync(() => updaters.selectProject(projectId));
      await sleep(350);
      flushSync(() => updaters.addPage('about.html'));
      await sleep(350);

      const state = getStoredState()!;
      const activeProject = state.projects.find(p => p.id === projectId)!;
      expect(activeProject.pages.length).toBe(2);
      expect(activeProject.pages[1].name).toBe('about.html');
    });

    it('Page Management: should delete a page after confirmation', async () => {
      // Setup: select a project and add a page to delete
      const projectId = getStoredState()!.projects[0].id;
      flushSync(() => updaters.selectProject(projectId));
      await sleep(350);
      flushSync(() => updaters.addPage('about.html'));
      await sleep(350);

      const activeProjectPreDelete = updaters.state.projects.find(p => p.id === projectId)!;
      expect(activeProjectPreDelete.pages.length).toBe(2);
      const pageToDelete = activeProjectPreDelete.pages[1];

      // Action: Request deletion
      flushSync(() => {
        updaters.requestConfirmation(
          `Delete ${pageToDelete.name}?`,
          () => { updaters.deletePage(pageToDelete.id); }
        );
      });
      
      // Pre-condition Assert: Check confirmation state
      expect(updaters.state.confirmationRequest).not.toBeNull();
      
      // Action: Simulate confirmation
      flushSync(() => {
        updaters.state.confirmationRequest!.onConfirm();
        updaters.clearConfirmation();
      });
      await sleep(350);
      
      // Post-condition Assert: Check page is deleted
      const finalState = getStoredState()!;
      const activeProjectPostDelete = finalState.projects.find(p => p.id === projectId)!;
      expect(activeProjectPostDelete.pages.length).toBe(1);
      expect(activeProjectPostDelete.pages.find(p => p.id === pageToDelete.id)).toBe(undefined);
      expect(finalState.confirmationRequest).toBeNull();
    });

    it('Element Management: should add an element to a page in the active project', async () => {
      const projectId = getStoredState()!.projects[0].id;
      flushSync(() => updaters.selectProject(projectId));
      await sleep(350);

      const stateBeforeAdd = getStoredState()!;
      const pageId = stateBeforeAdd.projects[0].pages[0].id;
      const rootId = stateBeforeAdd.projects[0].pages[0].rootElement.id;
      
      flushSync(() => updaters.addElement(pageId, rootId, 'div'));
      await sleep(350);

      const stateAfterAdd = getStoredState()!;
      const activeProject = stateAfterAdd.projects.find(p => p.id === projectId)!;
      const page = activeProject.pages.find(p => p.id === pageId)!;
      expect(page.rootElement.children.length).toBe(1);
      expect(page.rootElement.children[0].tag).toBe('div');
    });

    it('Reusable Components: should save an element as a component within the active project', async () => {
      // Setup: Create a second project and select the first
      flushSync(() => updaters.createProject('Second Project'));
      await sleep(350);
      const firstProjectId = getStoredState()!.projects[0].id;
      flushSync(() => updaters.selectProject(firstProjectId));
      await sleep(350);

      // Add an element to the first project
      const state = getStoredState()!;
      const pageId = state.projects[0].pages[0].id;
      const rootId = state.projects[0].pages[0].rootElement.id;
      flushSync(() => updaters.addElement(pageId, rootId, 'div'));
      await sleep(350);

      // Select element and save as component
      const childId = getStoredState()!.projects[0].pages[0].rootElement.children[0].id;
      flushSync(() => updaters.selectElement(childId));
      await sleep(350);
      flushSync(() => updaters.saveElementAsComponent('My Card'));
      await sleep(350);
      
      // Assertions
      const finalState = getStoredState()!;
      const project1 = finalState.projects.find(p => p.id === firstProjectId)!;
      const project2 = finalState.projects[1];
      
      expect(project1.components.length).toBe(1);
      expect(project1.components[0].name).toBe('My Card');
      expect(project2.components.length).toBe(0); // Should not affect other projects
    });
  });
};