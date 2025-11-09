import express from 'express';
import * as certificateController from './certificateController';

const router = express.Router();

/**
 * @openapi
 * /certificates:
 *   post:
 *     summary: Crea un certificado
 *     tags:
 *       - Certificates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               foundationId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Certificado creado
 */
router.post('/', certificateController.createCertificateController);

/**
 * @openapi
 * /certificates:
 *   get:
 *     summary: Obtiene todos los certificados
 *     tags:
 *       - Certificates
 *     responses:
 *       200:
 *         description: Lista de certificados
 */
router.get('/', certificateController.getCertificatesController);

/**
 * @openapi
 * /certificates/{id}:
 *   get:
 *     summary: Obtiene un certificado por ID
 *     tags:
 *       - Certificates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del certificado
 *     responses:
 *       200:
 *         description: Certificado encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/:id', certificateController.getCertificateByIdController);

/**
 * @openapi
 * /certificates/{id}:
 *   put:
 *     summary: Actualiza un certificado por ID
 *     tags:
 *       - Certificates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del certificado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               foundationId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Certificado actualizado
 *       404:
 *         description: No encontrado
 */
router.put('/:id', certificateController.updateCertificateController);

/**
 * @openapi
 * /certificates/{id}:
 *   delete:
 *     summary: Elimina un certificado por ID
 *     tags:
 *       - Certificates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del certificado
 *     responses:
 *       200:
 *         description: Certificado eliminado
 */
router.delete('/:id', certificateController.deleteCertificateController);

export default router;