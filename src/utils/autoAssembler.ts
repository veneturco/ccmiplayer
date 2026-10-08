// src/utils/autoAssembler.ts
import { ScriptScene, MediaClip, AspectRatio } from '../types';

export async function buildTimelineFromScript(
  scenes: ScriptScene[],
  aspectRatio: AspectRatio = '16:9'
): Promise<MediaClip[]> {
  const orientation =
    aspectRatio === '9:16' || aspectRatio === '4:5'
      ? 'portrait'
      : aspectRatio === '1:1'
      ? 'square'
      : 'landscape';

  const generatedClips: MediaClip[] = [];

  for (const scene of scenes) {
    const duration = +(scene.endSeconds - scene.startSeconds).toFixed(1);
    const query = scene.visualTag || scene.title;

    try {
      const response = await fetch(
        `/api/stock/videos?query=${encodeURIComponent(query)}&orientation=${orientation}`
      );
      const data = await response.json();

      const bestClip = data.items && data.items.length > 0 ? data.items[0] : null;

      if (bestClip) {
        generatedClips.push({
          id: `auto-${Date.now()}-${scene.id}`,
          type: 'video',
          name: `${query.substring(0, 15)} (${bestClip.source})`,
          url: bestClip.url,
          duration: duration,
          trimStart: 0,
          trimEnd: duration,
          transition: 'fade',
          transitionDuration: 0.4,
          fitMode: 'cover',
        });
      } else {
        // Fallback robusto a gradiente oscuro sólido si no hay internet o falla la API
        generatedClips.push(createFallbackClip(query, duration));
      }
    } catch (error) {
      console.warn(`Fallback local generado para escena: ${scene.id}`, error);
      generatedClips.push(createFallbackClip(query, duration));
    }
  }

  return generatedClips;
}

function createFallbackClip(name: string, duration: number): MediaClip {
  // SVG negro puro en base64 para evitar pantallas en blanco en el render final
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="100%" height="100%" fill="%230f172a"/></svg>`;
  return {
    id: `fallback-${Date.now()}-${Math.random()}`,
    type: 'image',
    name: `Fallback: ${name.substring(0, 15)}`,
    url: fallbackSvg,
    duration: duration,
    transition: 'fade',
    transitionDuration: 0.4,
    fitMode: 'cover',
  };
}
