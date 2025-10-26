import { Router } from "express";
import * as controller from "./stripeController";
import { stripeWebhookController } from "./stripeWebhook/controller";
import express from "express";

const router = Router();

router.post("/donations", controller.createDonationIntentController);
router.put("/donations/:paymentIntentId", controller.updateDonationIntentController);
router.get("/payment-intent/:id", controller.getPaymentIntentController);
router.get("/payment-method/:id", controller.getPaymentMethodController);

router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhookController
);

export default router;