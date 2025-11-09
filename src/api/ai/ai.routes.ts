// src/api/ai/ai.routes.ts

import express from 'express';
import multer from 'multer';
import * as aiController from './aiController'; // <-- Importamos como namespace

const router = express.Router();

// Configuración de Multer (en memoria)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 70 * 1024 * 1024 } // 70MB, igual que tu bodyParser
});

/**
 * @openapi
 * /ai/pixelate:
 *   post:
 *     summary: Pixelate una imagen de mascota (subida multipart/form-data)
 *     tags:
 *       - AI
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pet_image:
 *                 type: string
 *                 format: binary
 *               pixelSize:
 *                 type: integer
 *                 description: Tamaño de píxel opcional
 *     responses:
 *       200:
 *         description: Imagen procesada (base64 o URL según implementación)
 *       400:
 *         description: Error en los datos de entrada
 */
router.post(
  '/pixelate',
  upload.single('pet_image'), // Middleware de Multer
  aiController.pixelateController // Controlador corregido
);

export default router;