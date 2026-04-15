export async function exportAsZip(
  mdxContent: string,
  slug: string,
  contentType: 'project' | 'blog',
  imageFiles?: Map<string, File>,
): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  const folder = contentType === 'project' ? 'projects' : 'blog';
  const filePath = `src/content/${folder}/${slug}.mdx`;

  zip.file(filePath, mdxContent);

  // Add uploaded images to the ZIP
  if (imageFiles) {
    for (const [path, file] of imageFiles) {
      const buffer = await file.arrayBuffer();
      // path starts with /assets/..., place under public/
      zip.file(`public${path}`, buffer);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug || 'untitled'}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
