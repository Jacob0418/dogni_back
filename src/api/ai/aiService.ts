// src/api/ai/ai.service.ts

import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';
import 'multer';
import { ParametersError } from '../../shared/classes/api-errors'; // <-- Importamos tu clase de error
import { BaseError } from '../../shared/classes/base-error'; // <-- Para errores de API

// --- Tipos para la API de Gemini (igual que antes) ---
interface StyleImage {
  filename: string;
  buffer: Buffer;
  mimeType: string;
}

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}
// ... (puedes añadir el resto de tipos de la respuesta anterior)

function findAssetsDir(): string | null {
  const candidates = [
    path.join(__dirname, "image"),
    path.join(process.cwd(), "src", "api", "ai", "image"),
    path.join(process.cwd(), "dist", "api", "ai", "image"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return null;
}

// --- Variable de módulo para "cachear" las imágenes ---
let styleImages: StyleImage[] = [];

/**
 * Carga las imágenes de referencia desde la carpeta /assets en la raíz.
 * Se auto-ejecuta una vez cuando el servidor se inicia.
 */
function loadReferenceImages() {
  console.log('--- Cargando imágenes de referencia (Módulo AI) ---');
  const referenceFiles = ['image4.png', 'image8.png', 'image9.png', 'image10.png'];

  const assetsDir = findAssetsDir();
  if (!assetsDir) {
    console.error(`⚠️ [AI] No se encontró la carpeta de imágenes. Buscadas:\n - ${[
      path.join(__dirname, "image"),
      path.join(process.cwd(), "src", "api", "ai", "image"),
      path.join(process.cwd(), "dist", "api", "ai", "image"),
    ].join("\n - ")}`);
    console.error('❌ [AI] Error Crítico: No se pudo cargar ninguna imagen de referencia.');
    process.exit(1);
  }

  referenceFiles.forEach(filename => {
    try {
      const buffer = fs.readFileSync(path.join(assetsDir, filename));
      styleImages.push({
        filename,
        buffer,
        mimeType: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
      });
      console.log(`✅ [AI] Imagen de referencia ${filename} cargada desde ${assetsDir}.`);
    } catch (error) {
      console.warn(`⚠️ [AI] Advertencia: No se pudo cargar ${filename} desde ${assetsDir}.`);
    }
  });

  if (styleImages.length === 0) {
    console.error('❌ [AI] Error Crítico: No se pudo cargar ninguna imagen de referencia.');
    process.exit(1);
  }
  console.log(`📚 [AI] Total de imágenes cargadas: ${styleImages.length}`);
  console.log('--------------------------------------');
}

// ¡Ejecuta la carga de imágenes al iniciar!
loadReferenceImages();

// --- Definición del Prompt ---
const AI_PROMPT: string = `CRITICAL: Analyze the first image (the user's pet) and re-render it in the exact same pose, facing direction, and composition. DO NOT flip, rotate, mirror, or alter the pet's original shape.

Apply the pixel art style seen in the following reference images. The final image must look like it belongs with the reference images (matching pixel density, shading, lighting, and post-apocalyptic theme).

Output only the final pixel art image, no text.`;


/**
 * Llama a la API de Gemini para "pixelar" la imagen del usuario.
 * @param userImage El archivo de imagen subido por el usuario.
 * @returns Una promesa que resuelve a la imagen en base64.
 */
export async function servicePixelateImage(userImage: Express.Multer.File | undefined): Promise<string> {
  // 1. Validación (como en tu foundationService)
  if (!userImage) {
    throw new ParametersError('No se subió ninguna imagen.');
  }

  try {
    const userImageBuffer = userImage.buffer;
    const userMimeType = userImage.mimetype;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ La API Key de Gemini no está configurada.');
      // Usamos BaseError como en tu foundationModel
      throw new BaseError({ 
        log: 'La API Key de Gemini no está configurada.', 
        methodName: 'servicePixelateImage' 
      });
    }

    console.log('🔑 API Key configurada.');

    // 2. Construir Payload
    const parts: GeminiPart[] = [
      { text: AI_PROMPT },
      {
        inlineData: {
          mimeType: userMimeType,
          data: userImageBuffer.toString('base64'),
        },
      },
      ...styleImages.map(img => ({
        inlineData: {
          mimeType: img.mimeType,
          data: img.buffer.toString('base64'),
        },
      })),
    ];

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        temperature: 0.2,
        topK: 20,
        topP: 0.8,
      },
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

    // 3. Llamada a la API
    console.log(`🚀 Enviando petición a Gemini con ${styleImages.length} imágenes de ref...`);
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('❌ Error en la respuesta de la API de Gemini:', apiResponse.status);
      throw new BaseError({
          log: `Error de la API de Gemini: ${errorBody}`,
          methodName: 'servicePixelateImage',
          httpCode: apiResponse.status
      });
    }

    const result: any = await apiResponse.json();
    const base64Data = result?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;

    // 4. Validación de la respuesta
    if (!base64Data) {
      console.error('❌ La API de Gemini no devolvió datos de imagen.');
      const textPart = result?.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
      if (textPart) {
          throw new BaseError({ log: `La API devolvió texto en lugar de imagen: ${textPart.text}`, methodName: 'servicePixelateImage' });
      }
      throw new BaseError({ log: 'La respuesta de la API no contenía una imagen.', methodName: 'servicePixelateImage' });
    }

    console.log('✅ Imagen procesada con éxito.');
    return base64Data;

  } catch (error) {
    // Si no es un BaseError, lo relanzamos como uno
    if (!(error instanceof BaseError) && !(error instanceof ParametersError)) {
        console.error('Error procesando la imagen:', error);
        throw new BaseError({ error: error, methodName: "servicePixelateImage", log: "Error procesando la imagen" });
    }
    // Si ya es un error conocido (BaseError, ParametersError), solo lo relanzamos
    throw error;
  }
}