import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';
import 'multer';
import { GoogleGenAI } from '@google/genai';
import { ParametersError } from '../../shared/classes/api-errors';
import { BaseError } from '../../shared/classes/base-error';
import { canUserGenerateImage, recordImageGeneration } from './aiModel';
import { HttpStatusCode } from '../../shared/models/http.model'; 

interface StyleImage {
  filename: string;
  buffer: Buffer;
  mimeType: string;
}

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

let styleImages: StyleImage[] = [];

function loadReferenceImages() {
  const referenceFiles = ['image4.png', 'image8.png', 'image9.png', 'image10.png'];

  const assetsDir = findAssetsDir();

  referenceFiles.forEach(filename => {
    try {
      const buffer = fs.readFileSync(path.join(assetsDir, filename));
      styleImages.push({
        filename,
        buffer,
        mimeType: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
      });
    } catch (error) {
      console.warn(`Advertencia: No se pudo cargar iamgenes de referencia`);
    }
  });
}

loadReferenceImages();

//Definición del Prompt
const AI_PROMPT: string = `CRITICAL: Analyze the first image (the user's pet) and re-render it in the exact same pose, facing direction, and composition. DO NOT flip, rotate, mirror, or alter the pet's original shape.

Apply the pixel art style seen in the following reference images. The final image must look like it belongs with the reference images (matching pixel density, shading, lighting, and post-apocalyptic theme).

Output only the final pixel art image, no text.`;


export async function servicePixelateImage(userImage: Express.Multer.File | undefined, userId?: string): Promise<string> {

  if (!userImage) {
    throw new ParametersError('No se subió ninguna imagen.');
  }

  if (userId) {
    const canGenerate = await canUserGenerateImage(userId);
    
    if (!canGenerate) {
      throw new BaseError({ 
        log: 'Has alcanzado el límite de imágenes por día. Intenta nuevamente en unas horas.', 
        methodName: 'servicePixelateImage',
        httpCode: HttpStatusCode.CONFLICT
      });
    }
  }

  try {
    const userImageBuffer = userImage.buffer;
    const userMimeType = userImage.mimetype;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('La API Key de Gemini no está configurada.');
      throw new BaseError({ 
        log: 'La API Key de Gemini no está configurada.', 
        methodName: 'servicePixelateImage' 
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const parts = [
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

    const config = {
      responseModalities: ['IMAGE'],
      temperature: 0.2,
      topK: 20,
      topP: 0.8,
    };

    const contents = [
      {
        role: 'user',
        parts,
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      config,
      contents,
    });

    const base64Data = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;

    if (!base64Data) {
      console.error('La API de Gemini no devolvió datos de imagen.');
      const textPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
      if (textPart) {
        throw new BaseError({ 
          log: `La API devolvió texto en lugar de imagen: ${textPart.text}`, 
          methodName: 'servicePixelateImage' 
        });
      }
      throw new BaseError({ 
        log: 'La respuesta de la API no contenía una imagen.', 
        methodName: 'servicePixelateImage' 
      });
    }

    console.log('Imagen procesada con éxito.');
    
    if (userId) {
      try {
        await recordImageGeneration(userId);
      } catch (recordError) {
        console.error('Error al registrar generación:', recordError);
      }
    }
    
    return base64Data;

  } catch (error) {
    if (!(error instanceof BaseError) && !(error instanceof ParametersError)) {
      console.error('Error procesando la imagen:', error);
      throw new BaseError({ 
        error: error, 
        methodName: "servicePixelateImage", 
        log: "Error procesando la imagen" 
      });
    }
    throw error;
  }
}