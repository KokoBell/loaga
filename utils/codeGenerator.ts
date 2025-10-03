import { Project, Element, Page, GlobalStyle } from '../types';

function generateElementCSS(element: Element, cssMap: Map<string, string>): void {
  const styleString = Object.entries(element.styles)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}: ${value};`;
    })
    .join(' ');

  if (styleString) {
    cssMap.set(`.el-${element.id}`, `{ ${styleString} }`);
  }

  element.children.forEach(child => generateElementCSS(child, cssMap));
}

export function generateCSS(project: Project): string {
  const cssMap = new Map<string, string>();
  
  project.pages.forEach(page => {
    generateElementCSS(page.rootElement, cssMap);
  });
  
  project.globalStyles.forEach((globalStyle: GlobalStyle) => {
    const styleString = Object.entries(globalStyle.styles)
      .map(([key, value]) => {
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${kebabKey}: ${value};`;
      })
      .join(' ');
      
    if (styleString) {
      cssMap.set(globalStyle.selector, `{ ${styleString} }`);
    }
  });

  return Array.from(cssMap.entries()).map(([selector, rules]) => `${selector} ${rules}`).join('\n');
}

function generateElementHTML(element: Element): string {
  const { tag, attributes, children, textContent, id, classNames } = element;
  
  if (tag === 'body') {
     return children.map(generateElementHTML).join('');
  }

  const attrs = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  
  const classAttr = `class="el-${id}${classNames ? ` ${classNames}` : ''}"`;
  const finalAttrs = [classAttr, attrs].filter(Boolean).join(' ');

  const selfClosingTags = ['img', 'input', 'br', 'hr', 'link', 'meta'];
  if (selfClosingTags.includes(tag)) {
    return `<${tag} ${finalAttrs}>`;
  }

  const childrenHtml = children.map(generateElementHTML).join('');
  return `<${tag} ${finalAttrs}>${textContent || ''}${childrenHtml}</${tag}>`;
}


export function generateHTML(page: Page, project: Project): string {
    const bodyContent = generateElementHTML(page.rootElement);
    const cssContent = generateCSS(project);
    
    const bodyClasses = `el-${page.rootElement.id}${page.rootElement.classNames ? ` ${page.rootElement.classNames}`: ''}`;

    const scripts = page.scripts
      .map(scriptId => project.scripts.find(s => s.id === scriptId))
      .filter(Boolean)
      .map(script => `<script src="./${script!.name}" defer></script>`) // Use relative path for JS files
      .join('\n    ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.name.replace('.html', '')}</title>
  <link rel="stylesheet" href="./style.css">
  ${scripts}
</head>
<body class="${bodyClasses}">
  ${bodyContent}
  <style>
    /* For preview purposes, styles are inlined. In downloaded project, they are in style.css */
    ${cssContent}
  </style>
</body>
</html>`;
}