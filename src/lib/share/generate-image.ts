import html2canvas from 'html2canvas';
import { downloadBlob } from './share-utils';

/**
 * Generate PNG from a DOM element
 */
export async function generateImage(element: HTMLElement): Promise<Blob | null> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#000000',
      scale: 2, // Retina quality
      logging: false,
      useCORS: true,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    console.error('Failed to generate image:', error);
    return null;
  }
}

/**
 * Download share card as PNG
 */
export async function downloadShareCard(
  element: HTMLElement,
  filename: string = 'particle-of-the-week.png'
): Promise<boolean> {
  const blob = await generateImage(element);
  if (!blob) return false;

  downloadBlob(blob, filename);
  return true;
}
