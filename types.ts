export interface Style {
  [key: string]: string;
}

export interface Element {
  id: string;
  tag: string;
  attributes: { [key: string]: string };
  styles: Style;
  children: Element[];
  textContent?: string;
  classNames?: string; // For CSS classes
}

export interface Page {
  id: string;
  name: string;
  rootElement: Element;
  scripts: string[]; // Array of script IDs
}

export interface Script {
  id:string;
  name: string;
  content: string;
}

// Reusable component blueprint
export interface Component {
  id: string;
  name: string;
  rootElement: Element;
}

// Global style rule
export interface GlobalStyle {
  selector: string;
  styles: Style;
}

export interface Project {
  id: string; // New
  name: string; // New
  pages: Page[];
  scripts: Script[];
  components: Component[];
  globalStyles: GlobalStyle[];
}

export interface AppState {
  projects: Project[]; // Changed
  activeProjectId: string | null; // Changed

  // These are UI state properties, tied to the active project
  activePageId: string | null;
  activeScriptId: string | null;
  activeGlobalStyleSelector: string | null;
  selectedElementId: string | null;
  
  previewMode: boolean;
  isDragging: boolean;
  confirmationRequest: {
    message: string;
    onConfirm: () => void;
  } | null;
}

export enum ItemType {
  ELEMENT = 'ELEMENT',
  COMPONENT = 'COMPONENT',
}