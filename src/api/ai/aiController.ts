// src/api/ai/ai.controller.ts

import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../../shared/models/http.model'; // <-- Usamos tu HttpStatusCode
import * as aiService from './aiService'; // <-- Importamos el servicio como namespace

export async function pixelateController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // El servicio (servicePixelateImage) se encargará de validar si req.file existe
    const imageData = await aiService.servicePixelateImage(req.file);

    // Respuesta exitosa, siguiendo tu formato
    res.status(200).send({
      status: HttpStatusCode.OK,
      message: 'Image pixelated successfully',
      data: { imageData }, // Enviamos la data en un objeto
    });
  } catch (error) {
    // Pasamos el error al middleware central
    next(error);
  }
}