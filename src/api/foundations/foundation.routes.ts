import express from 'express';
import * as foundationController from './foundationController';

const router = express.Router();

/**
 * @openapi
 * /foundations:
 *   post:
 *     summary: Crea una fundación
 *     tags:
 *       - Foundations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fundación creada
 */
router.post('/', foundationController.createFoundationController);

/**
 * @openapi
 * /foundations:
 *   get:
 *     summary: Obtiene todas las fundaciones
 *     tags:
 *       - Foundations
 *     responses:
 *       200:
 *         description: Lista de fundaciones
 */
router.get('/', foundationController.getFoundationsController);

/**
 * @openapi
 * /foundations/{id}:
 *   get:
 *     summary: Obtiene una fundación por ID
 *     tags:
 *       - Foundations
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la fundación
 *     responses:
 *       200:
 *         description: Fundación encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/:id', foundationController.getFoundationByIdController);

/**
 * @openapi
 * /foundations/{id}:
 *   put:
 *     summary: Actualiza una fundación por ID
 *     tags:
 *       - Foundations
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Fundación actualizada
 */
router.put('/:id', foundationController.updateFoundationController);

/**
 * @openapi
 * /foundations/{id}:
 *   delete:
 *     summary: Elimina una fundación por ID
 *     tags:
 *       - Foundations
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       204:
 *         description: Fundación eliminada
 */
router.delete('/:id', foundationController.deleteFoundationController);

export default router;