import type { ParticleOfWeek } from '@/lib/coach/particle-of-week';

const PARTICLE_URL = 'https://particle.app';

/**
 * Generate Twitter share URL with pre-filled text
 */
export function getTwitterShareUrl(potw: ParticleOfWeek): string {
  const duration = Math.round(potw.session.duration / 60);
  const text = `${potw.narrative.opening}\n\n${duration} min of deep focus.\n\nMade with @ParticleApp`;

  const params = new URLSearchParams({
    text,
    url: PARTICLE_URL,
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Generate LinkedIn share URL
 */
export function getLinkedInShareUrl(): string {
  const params = new URLSearchParams({
    url: PARTICLE_URL,
  });

  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * Copy narrative text to clipboard
 */
export async function copyNarrativeToClipboard(potw: ParticleOfWeek): Promise<boolean> {
  const duration = Math.round(potw.session.duration / 60);
  const text = `${potw.narrative.opening}\n\n${potw.narrative.body}\n\n${potw.narrative.meaning}\n\n${duration} min · Made with Particle`;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download a blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
