// This file requires the 'jszip' library.
// We'll create a placeholder that explains its usage.
// In a real project: npm install jszip

declare class JSZip {
  file(name: string, data: string): void;
  generateAsync(options: { type: 'blob' }): Promise<Blob>;
}

export async function zipAndDownloadProject(
  htmlFiles: { name: string, content: string }[],
  jsFiles: { name: string, content: string }[],
  cssContent: string
) {
  try {
    // Dynamically import JSZip from a CDN
    const jszipScript = document.createElement('script');
    jszipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    document.body.appendChild(jszipScript);
    
    await new Promise(resolve => jszipScript.onload = resolve);

    const zip = new (window as any).JSZip();

    htmlFiles.forEach(file => zip.file(file.name, file.content));
    jsFiles.forEach(file => zip.file(file.name, file.content));
    zip.file('style.css', cssContent); // Even though injected, provide a separate file for user convenience

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'website-project.zip';
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(jszipScript);
  } catch (error) {
    console.error("Failed to create or download zip file:", error);
    alert("Could not download project. Make sure you are connected to the internet to load the zipping library.");
  }
}