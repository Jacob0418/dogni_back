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

// Definimos la ruta POST
router.post(
  '/pixelate',
  upload.single('pet_image'), // Middleware de Multer
  aiController.pixelateController // Controlador corregido
);

export default router;