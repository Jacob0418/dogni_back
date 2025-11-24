import express from 'express';
import multer from 'multer';
import * as aiController from './aiController';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 70 * 1024 * 1024 }
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
 *             required:
 *               - pet_image
 *               - userId
 *             properties:
 *               pet_image:
 *                 type: string
 *                 format: binary
 *               userId:
 *                 type: string
 *                 description: UID del usuario de Firebase
 *     responses:
 *       200:
 *         description: Imagen procesada (base64)
 *       400:
 *         description: Error en los datos de entrada
 *       409:
 *         description: Límite de generaciones alcanzado (2 por día)
 */
router.post(
  '/pixelate',
  upload.single('pet_image'), 
  aiController.pixelateController 
);

/**
 * @openapi
 * /ai/verificar-disponibilidad/{userId}:
 *   get:
 *     summary: Verifica cuántas imágenes le quedan al usuario
 *     tags:
 *       - AI
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: UID del usuario de Firebase
 *     responses:
 *       200:
 *         description: Estado de disponibilidad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     remainingGenerations:
 *                       type: number
 *                     maxGenerations:
 *                       type: number
 *                     isLimitReached:
 *                       type: boolean
 *                     nextResetTime:
 *                       type: string
 *                       format: date-time
 *                     periodStartDate:
 *                       type: string
 *                       format: date-time
 */
router.get('/verificar-disponibilidad/:userId', aiController.checkGenerationStatusController);

export default router;