import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { z } from 'zod';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middlewares de seguridad y optimización
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(express.json({ limit: '25mb' })); // Ampliado para audios largos

// Rate Limiter: Protege la cuota de la API de Gemini
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto por IP
  message: { error: 'Límite de peticiones excedido. Espera un minuto.' },
});

app.use('/api/', apiLimiter);

// Schemas de Validación con Zod
const TTSSchema = z.object({
  text: z.string().min(1).max(3000),
  voice: z.enum(['Kore', 'Zephyr', 'Puck', 'Charon', 'Fenrir']).default('Kore'),
  style: z.string().default('Voz profesional y empática'),
  sceneTitle: z.string().optional(),
});

const ScriptSchema = z.object({
  topic: z.string().min(1).max(1000),
  durationSeconds: z.number().min(5).max(180).default(18),
  tone: z.string().default('cálido y empático'),
  targetAudience: z.string().optional(),
});

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Endpoint TTS Optimizado (Gemini-3.8-flash-tts)
app.post('/api/tts/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voice, style, sceneTitle } = TTSSchema.parse(req.body);

    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY no configurada.' });
      return;
    }

    // Inyectar el estilo y el contexto directamente en el prompt
    const contextualizedText = `Instrucción de dirección: Habla con voz de ${voice}, tono: ${style}.\nTexto a leer:\n${text.trim()}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: contextualizedText,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice || 'Kore',
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioParts = candidate?.content?.parts?.filter((p) => p.inlineData?.mimeType?.startsWith('audio')) || [];

    if (audioParts.length === 0) {
      res.status(502).json({ error: 'No se recibió audio válido de Gemini.' });
      return;
    }

    // Unir fragmentos base64 si Gemini envía respuestas chunked
    const base64Audio = audioParts.map((p) => p.inlineData?.data || '').join('');

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: audioParts[0].inlineData?.mimeType || 'audio/wav',
      modelUsed: 'gemini-3.8-flash-tts',
      voice,
      sceneTitle,
    });
  } catch (error: any) {
    console.error('Error TTS:', error);
    res.status(error instanceof z.ZodError ? 400 : 500).json({
      error: error instanceof z.ZodError ? 'Datos inválidos' : 'Error en síntesis',
      details: error.message,
    });
  }
});

// 2. Endpoint Guión con JSON Schema estricto
app.post('/api/script/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, durationSeconds, tone } = ScriptSchema.parse(req.body);
    const numScenes = durationSeconds <= 20 ? 3 : durationSeconds <= 40 ? 4 : 5;

    const prompt = `Actúa como guionista médico audiovisual (CCMI).
Tema: "${topic}". Duración: ${durationSeconds} segundos. Tono: ${tone}.
Genera exactamente ${numScenes} escenas cronometradas para cubrir ${durationSeconds} segundos con ritmo natural.

Devuelve EXCLUSIVAMENTE JSON con:
{
  "fullScript": "el texto completo continuo",
  "scenes": [
    {
      "sceneNumber": 1,
      "timeRange": "00:00 - 00:06",
      "startSeconds": 0,
      "endSeconds": 6,
      "text": "texto hablado de la escena 1",
      "title": "Título descriptivo",
      "highlightWords": ["palabra1", "palabra2"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let parsed;
    try {
      parsed = JSON.parse(response.text || '{}');
      if (!parsed.scenes || !Array.isArray(parsed.scenes)) throw new Error('Schema no cumplido');
    } catch {
      throw new Error('Gemini devolvió un JSON inválido o incompleto.');
    }

    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al generar guión' });
  }
});

// 3. Endpoint Director IA para analizar cadencia y notas
app.post('/api/script/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { scriptScenes } = req.body;
    if (!apiKey) {
      res.json({
        overallPacing: 'Estructura adecuada para spot institucional.',
        directorNote: 'Mantén una articulación suave, tono seguro y pausado, acentuando palabras clave.',
      });
      return;
    }

    const prompt = `Actúa como un director de voz y locución audiovisual profesional para comerciales médicos de clínicas y centros quirúrgicos (CCMI / CSMI).
Analiza este guión estructurado en escenas con sus marcas de tiempo:
${JSON.stringify(scriptScenes, null, 2)}

Proporciona en formato JSON:
1. "overallPacing": evaluación de la cadencia y duración general.
2. "sceneFeedback": lista de objetos con "sceneId", "toneRecommendation", "emphasisWords", "breathingAdvice".
3. "directorNote": consejo de dirección para el locutor.`;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(aiRes.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error analyzing script:', err);
    res.json({
      overallPacing: 'Excelente estructura de 18 segundos para spot institucional.',
      directorNote: 'Mantén una articulación suave, tono seguro y pausado, acentuando palabras como "seguro", "empatía" y "bienestar".',
    });
  }
});

// 4. Endpoint de B-Roll Stock (Pexels + Pixabay + Caching en Memoria)
const StockQuerySchema = z.object({
  query: z.string().min(1).max(100),
  orientation: z.enum(['landscape', 'portrait', 'square']).default('landscape'),
});

const stockCache = new Map<string, { at: number; data: any }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

app.get('/api/stock/videos', async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, orientation } = StockQuerySchema.parse(req.query);
    const cacheKey = crypto.createHash('sha256').update(`${query}|${orientation}`).digest('hex');
    const cached = stockCache.get(cacheKey);

    if (cached && Date.now() - cached.at < CACHE_TTL) {
      res.json({ ...cached.data, cached: true });
      return;
    }

    const PEXELS_KEY = process.env.PEXELS_API_KEY;
    const PIXABAY_KEY = process.env.PIXABAY_API_KEY;

    const results: any[] = [];

    if (PEXELS_KEY || PIXABAY_KEY) {
      // Promesa Pexels (Videos)
      const pexelsPromise = PEXELS_KEY
        ? fetch(
            `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=5`,
            { headers: { Authorization: PEXELS_KEY } }
          )
            .then((r) => r.json())
            .then((data) =>
              (data.videos || []).map((v: any) => ({
                id: `px-${v.id}`,
                source: 'pexels',
                type: 'video',
                url:
                  v.video_files.find((f: any) => f.quality === 'hd' || f.quality === 'sd')?.link ||
                  v.video_files[0]?.link,
                author: v.user.name,
                width: v.width,
                height: v.height,
              }))
            )
            .catch((e) => {
              console.warn('Error Pexels:', e);
              return [];
            })
        : Promise.resolve([]);

      // Promesa Pixabay (Videos)
      const pixabayPromise = PIXABAY_KEY
        ? fetch(
            `https://pixabay.com/api/videos/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&per_page=5`
          )
            .then((r) => r.json())
            .then((data) =>
              (data.hits || []).map((v: any) => ({
                id: `pb-${v.id}`,
                source: 'pixabay',
                type: 'video',
                url: v.videos.medium.url,
                author: v.user,
                width: v.videos.medium.width,
                height: v.videos.medium.height,
              }))
            )
            .catch((e) => {
              console.warn('Error Pixabay:', e);
              return [];
            })
        : Promise.resolve([]);

      const [pexelsData, pixabayData] = await Promise.all([pexelsPromise, pixabayPromise]);

      const maxLength = Math.max(pexelsData.length, pixabayData.length);
      for (let i = 0; i < maxLength; i++) {
        if (pexelsData[i]) results.push(pexelsData[i]);
        if (pixabayData[i]) results.push(pixabayData[i]);
      }
    }

    // Fallback de stock curado gratuito de alta calidad si no hay keys o no hay resultados
    if (results.length === 0) {
      const fallbackMedicalVideos = [
        {
          id: 'stock-fallback-1',
          source: 'curated-stock',
          type: 'video',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-doctor-checking-a-patient-in-a-clinic-42838-large.mp4',
          author: 'Curated Medical Stock',
          width: 1920,
          height: 1080,
        },
        {
          id: 'stock-fallback-2',
          source: 'curated-stock',
          type: 'video',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-surgeon-preparing-for-surgery-in-an-operating-room-41584-large.mp4',
          author: 'Curated Medical Stock',
          width: 1920,
          height: 1080,
        },
        {
          id: 'stock-fallback-3',
          source: 'curated-stock',
          type: 'video',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-nurse-taking-care-of-a-patient-in-a-hospital-41588-large.mp4',
          author: 'Curated Medical Stock',
          width: 1920,
          height: 1080,
        },
      ];
      results.push(...fallbackMedicalVideos);
    }

    const finalData = { success: true, items: results.filter((i) => i.url) };
    stockCache.set(cacheKey, { at: Date.now(), data: finalData });

    res.json(finalData);
  } catch (error: any) {
    res.status(error instanceof z.ZodError ? 400 : 500).json({
      error: error instanceof z.ZodError ? 'Query inválida' : 'Error buscando stock',
      details: error.message,
    });
  }
});

// 4. Endpoints para Código Fuente y Bundle para IAs
const CORE_SOURCE_FILES = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html',
  'server.ts',
  'src/types.ts',
  'src/data/initialScript.ts',
  'src/utils/audioUtils.ts',
  'src/utils/videoRecorder.ts',
  'src/App.tsx',
  'src/components/Header.tsx',
  'src/components/AudioHub.tsx',
  'src/components/CapCutPanel.tsx',
  'src/components/TimelineEditor.tsx',
  'src/components/VideoPlayerPreview.tsx',
  'src/components/MobileCapCutStudio.tsx',
  'src/components/DirectorModal.tsx',
  'src/components/ExportModal.tsx',
  'src/components/TrimModal.tsx',
  'src/components/TransitionModal.tsx',
  'src/components/ScriptGeneratorModal.tsx',
  'src/components/PremiumUpgradeModal.tsx',
  'src/components/CodeExportModal.tsx',
  'src/components/SceneList.tsx',
  'src/components/VoiceSettings.tsx',
];

app.get('/api/project/files', async (_req: Request, res: Response) => {
  try {
    const rootDir = process.cwd();
    const resultFiles: Array<{ path: string; name: string; content: string; size: number; category: string }> = [];

    for (const relPath of CORE_SOURCE_FILES) {
      const fullPath = path.join(rootDir, relPath);
      if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf-8');
        content = content.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, 'AIzaSy_MASKED_GOOGLE_KEY');

        let category = 'Configuración';
        if (relPath.startsWith('src/components/')) category = 'Componentes UI';
        else if (relPath.startsWith('src/utils/')) category = 'Utilidades & DSP';
        else if (relPath.startsWith('src/data/')) category = 'Datos & Preajustes';
        else if (relPath === 'server.ts') category = 'Servidor Backend';
        else if (relPath === 'src/App.tsx') category = 'Componente Principal';
        else if (relPath === 'src/types.ts') category = 'Definición de Tipos';

        resultFiles.push({
          path: relPath,
          name: path.basename(relPath),
          content,
          size: Buffer.byteLength(content, 'utf-8'),
          category,
        });
      }
    }

    res.json({ files: resultFiles, count: resultFiles.length });
  } catch (err: any) {
    console.error('Error reading project files:', err);
    res.status(500).json({ error: 'No se pudieron leer los archivos del proyecto.' });
  }
});

app.get('/api/project/bundle', async (_req: Request, res: Response) => {
  try {
    const rootDir = process.cwd();
    let bundle = `# PROYECTO COMPLETO: CCMI CapCut Studio (Full-Stack Video & Audio Suite)\n`;
    bundle += `## Ecosistema: Google Gemini (TTS 3.8 Flash, Script Gen) + Web Audio API + HTML5 Canvas\n\n`;

    for (const relPath of CORE_SOURCE_FILES) {
      const fullPath = path.join(rootDir, relPath);
      if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf-8');
        content = content.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, 'AIzaSy_MASKED_GOOGLE_KEY');
        const ext = path.extname(relPath).replace('.', '') || 'txt';
        const lang = ext === 'ts' || ext === 'tsx' ? 'typescript' : ext === 'json' ? 'json' : ext === 'html' ? 'html' : 'text';

        bundle += `\n---\n### ARCHIVO: \`${relPath}\`\n\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
      }
    }

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ccmi-studio-full-codebase.md"');
    res.send(bundle);
  } catch (err: any) {
    console.error('Error generating bundle:', err);
    res.status(500).send('Error generating project bundle');
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor protegido en http://0.0.0.0:${PORT}`));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
