import { Element } from '../types';

// Pure, recursive function to update an element in the tree immutably
export const updateElementInTree = (root: Element, elementId: string, updateFn: (element: Element) => Element): Element => {
  if (root.id === elementId) {
    return updateFn(root);
  }

  if (root.children.length > 0) {
    const newChildren = root.children.map(child => updateElementInTree(child, elementId, updateFn));
    // If children instances have changed, it means an update happened, so we need a new root instance.
    if (newChildren.some((child, index) => child !== root.children[index])) {
      return { ...root, children: newChildren };
    }
  }
  
  return root; // Return original instance if no changes
};

// Pure, recursive function to remove an element from the tree immutably
export const removeElementFromTree = (root: Element, elementId: string): Element => {
  const newChildren = root.children
    .filter(child => child.id !== elementId)
    .map(child => removeElementFromTree(child, elementId));
  
  if (newChildren.length !== root.children.length || newChildren.some((child, index) => child !== root.children[index])) {
    return { ...root, children: newChildren };
  }

  return root;
};

// Pure, recursive function to insert an element into the tree immutably
export const insertElementInTree = (root: Element, parentId: string, index: number, element: Element): Element => {
  if (root.id === parentId) {
    const newChildren = [...root.children];
    newChildren.splice(index, 0, element);
    return { ...root, children: newChildren };
  }
  
  return {
    ...root,
    children: root.children.map(child => insertElementInTree(child, parentId, index, element)),
  };
};