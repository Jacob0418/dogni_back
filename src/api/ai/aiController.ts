import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../../shared/models/http.model'; 
import * as aiService from './aiService';
import { getGenerationStatus } from './aiModel';

export async function pixelateController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.body.userId || req.query.userId as string;
    
    if (!userId) {
      return res.status(400).send({
        status: HttpStatusCode.BAD_REQUEST,
        message: 'userId is required',
      });
    }

    const imageData = await aiService.servicePixelateImage(req.file, userId);
    res.status(200).send({
      status: HttpStatusCode.OK,
      message: 'Image pixelated successfully',
      data: { imageData },
    });
  } catch (error) {
    next(error);
  }
}

export async function checkGenerationStatusController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).send({
        status: HttpStatusCode.BAD_REQUEST,
        message: 'userId is required',
      });
    }

    const status = await getGenerationStatus(userId);

    res.status(200).send({
      status: HttpStatusCode.OK,
      message: 'Generation status retrieved successfully',
      data: status,
    });
  } catch (error) {
    next(error);
  }
}