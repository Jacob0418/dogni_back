import { Router } from "express";
import * as controller from "./stripeController";
import { stripeWebhookController } from "./stripeWebhook/controller";
import express from "express";

const router = Router();

/**
 * @openapi
 * /stripe/donations:
 *   post:
 *     summary: Crea un PaymentIntent para una donación
 *     tags:
 *       - Stripe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               foundationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: PaymentIntent creado
 */
router.post("/donations", controller.createDonationIntentController);

/**
 * @openapi
 * /stripe/donations/{paymentIntentId}:
 *   put:
 *     summary: Actualiza un PaymentIntent de donación
 *     tags:
 *       - Stripe
 *     parameters:
 *       - in: path
 *         name: paymentIntentId
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
 *         description: PaymentIntent actualizado
 */
router.put("/donations/:paymentIntentId", controller.updateDonationIntentController);

/**
 * @openapi
 * /stripe/payment-intent/{id}:
 *   get:
 *     summary: Obtiene un PaymentIntent por ID
 *     tags:
 *       - Stripe
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: PaymentIntent encontrado
 */
router.get("/payment-intent/:id", controller.getPaymentIntentController);

/**
 * @openapi
 * /stripe/payment-method/{id}:
 *   get:
 *     summary: Obtiene un método de pago por ID
 *     tags:
 *       - Stripe
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Método de pago encontrado
 */
router.get("/payment-method/:id", controller.getPaymentMethodController);

/**
 * @openapi
 * /stripe/webhook:
 *   post:
 *     summary: Endpoint público para webhooks de Stripe
 *     tags:
 *       - Stripe
 *     requestBody:
 *       description: Stripe webhook payload (raw)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook recibido
 */
router.post(
    "/webhook",
    stripeWebhookController
);

/**
 * @openapi
 * /stripe/donations:
 *   get:
 *     summary: Obtiene todas las donaciones
 *     tags:
 *       - Stripe
 *     responses:
 *       200:
 *         description: Lista de donaciones
 */
router.get("/donations", controller.getDonationsController);

/**
 * @openapi
 * /stripe/donations/{id}:
 *   get:
 *     summary: Obtiene una donación por ID
 *     tags:
 *       - Stripe
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Donación encontrada
 */
router.get("/donations/:id", controller.getDonationByIdController);

/**
 * @openapi
 * /stripe/donations/foundation/{foundationId}:
 *   get:
 *     summary: Obtiene donaciones por ID de fundación
 *     tags:
 *       - Stripe
 *     parameters:
 *       - in: path
 *         name: foundationId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Donaciones encontradas
 */
router.get("/donations/foundation/:foundationId", controller.getDonationsByFoundationIdController);

/**
 * @openapi
 * /stripe/donations/donor/{donorUid}:
 *   get:
 *     summary: Obtiene donaciones por UID del donante
 *     tags:
 *       - Stripe
 *     parameters:
 *       - in: path
 *         name: donorUid
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Donaciones encontradas
 */
router.get("/donations/donor/:donorUid", controller.getDonationsByDonorUidController);

export default router;