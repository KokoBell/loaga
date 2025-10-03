import React, { memo } from 'react';
import { useProject } from '../hooks/useProject';
import { Element, ItemType, Page } from '../types';
import { useDrop, useDrag } from 'react-dnd';

interface CanvasElementProps {
  pageId: string;
  element: Element;
}

const CanvasElement: React.FC<CanvasElementProps> = memo(({ pageId, element }) => {
  const { state, addElement, moveElement, selectElement, addComponentInstance, setIsDragging } = useProject();
  const { selectedElementId, isDragging: isAppDragging } = state;

  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemType.ELEMENT, ItemType.COMPONENT],
    drop: (item: { tag?: string; id?: string, componentId?: string }, monitor) => {
      if (monitor.didDrop()) return;
      if (item.tag) { // New element from left panel
        addElement(pageId, element.id, item.tag);
      } else if (item.id) { // Existing element being moved
        moveElement(pageId, item.id, element.id, element.children.length);
      } else if (item.componentId) { // New component instance
        addComponentInstance(pageId, element.id, item.componentId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
    }),
  }));

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.ELEMENT,
    item: () => {
      setIsDragging(true);
      return { id: element.id };
    },
    canDrag: () => !element.id.startsWith('root'),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (_item, _monitor) => {
      setIsDragging(false);
    },
  }));

  drag(drop(ref));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAppDragging) {
      return;
    }
    selectElement(element.id);
  };

  const isSelected = selectedElementId === element.id;
  const classNamesFromState = element.classNames || '';
  const finalClassName = `canvas-element el-${element.id} ${classNamesFromState} ${isSelected ? 'selected' : ''} ${isOver ? 'drop-target' : ''}`.trim();
  
  const elementStyle: React.CSSProperties = {
     opacity: isDragging ? 0.3 : 1,
     position: 'relative',
  };
  
  if (element.children.length === 0 && !element.textContent) {
      elementStyle.minHeight = '40px';
  }

  return (
    <div ref={ref} onClick={handleClick} className={finalClassName} style={elementStyle} >
      <div className="element-label">{`<${element.tag}>`}</div>
      {element.textContent}
      {element.children.map(child => (
        <CanvasElement key={child.id} pageId={pageId} element={child} />
      ))}
    </div>
  );
});

const Canvas = () => {
  const { state } = useProject();
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);
  if (!activeProject) return null;

  const currentPage = activeProject.pages.find((p: Page) => p.id === state.activePageId);

  if (!currentPage) {
    return <div className="p-4">Select a page to start designing.</div>;
  }
  
  return (
    <div className="p-4 bg-white h-full">
      <CanvasElement pageId={currentPage.id} element={currentPage.rootElement} />
       <style>{`
          .canvas-element {
            outline: 1px dashed #cbd5e1;
            padding: 4px;
            margin: 4px;
            transition: all 0.2s ease-in-out;
            position: relative;
          }
          .canvas-element.selected {
            outline: 2px solid var(--accent-blue);
            box-shadow: 0 0 10px rgba(88, 166, 255, 0.5);
          }
          .canvas-element.drop-target {
             background-color: rgba(88, 166, 255, 0.2);
             outline: 2px dashed var(--accent-blue);
          }
          .element-label {
            position: absolute;
            top: 0px;
            left: 0px;
            font-size: 10px;
            background-color: var(--accent-blue);
            color: white;
            padding: 1px 4px;
            border-radius: 0 0 4px 0;
            opacity: 0;
            transition: opacity 0.2s;
            z-index: 10;
          }
          .canvas-element.selected > .element-label, .canvas-element:hover > .element-label {
             opacity: 1;
          }
       `}</style>
    </div>
  );
};

export default Canvas;