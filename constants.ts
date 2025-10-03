import { React } from 'react'

export const HTML5_SEMANTIC_TAGS = [
  'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'img', 'a',
  'section', 'article', 'nav', 'aside', 'header', 'footer', 'main',
  'button', 'ul', 'ol', 'li', 'form', 'input', 'label', 'textarea'
];

export const DEFAULT_STYLES: { [key: string]: React.CSSProperties } = {
  div: { minHeight: '50px', padding: '10px', border: '1px dashed #4a5568' },
  p: { padding: '5px' },
  h1: { fontSize: '2em', fontWeight: 'bold', margin: '0.67em 0' },
  h2: { fontSize: '1.5em', fontWeight: 'bold', margin: '0.83em 0' },
  img: { maxWidth: '100%', height: 'auto', display: 'block' },
  a: { color: '#60a5fa', textDecoration: 'underline' },
  button: { padding: '8px 16px', border: '1px solid #6b7280', borderRadius: '4px', backgroundColor: '#4b5563', cursor: 'pointer' },
};

export const CSS_PROPERTIES = [
  'alignContent', 'alignItems', 'alignSelf', 'backgroundColor', 'backgroundImage',
  'border', 'borderBottom', 'borderLeft', 'borderRight', 'borderTop',
  'borderColor', 'borderRadius', 'borderWidth', 'bottom',
  'boxShadow', 'color', 'display', 'flex', 'flexBasis', 'flexDirection',
  'flexGrow', 'flexShrink', 'flexWrap', 'fontFamily', 'fontSize',
  'fontWeight', 'height', 'justifyContent', 'left', 'letterSpacing',
  'lineHeight', 'margin', 'marginBottom', 'marginLeft', 'marginRight',
  'marginTop', 'maxHeight', 'maxWidth', 'minHeight', 'minWidth',
  'opacity', 'overflow', 'overflowX', 'overflowY', 'padding', 'paddingBottom', 'paddingLeft',
  'paddingRight', 'paddingTop', 'position', 'right', 'textAlign',
  'textDecoration', 'textTransform', 'top', 'width', 'zIndex'
];