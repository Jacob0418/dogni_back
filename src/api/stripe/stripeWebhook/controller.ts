import { Request, Response, NextFunction } from "express";
import * as stripeService from "../stripeService";

const stripeKey =
    process.env.NODE_ENV === "production"
        ? process.env.STRIPE_PROD_SECRET_KEY
        : process.env.STRIPE_TEST_SECRET_KEY;

const stripe = require("stripe")(stripeKey);
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function stripeWebhookController(
    req: Request,
    res: Response,
    next: NextFunction
    ) {
    try {
        const sig = req.headers["stripe-signature"] as string | undefined;
        const rawBody = (req as any).rawBody ?? req.body;

        let event;
        if (stripeWebhookSecret) {
        if (!sig) return res.status(400).send("Missing stripe signature");
        try {
            event = stripe.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret);
        } catch (err: any) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        } else {
        event = rawBody;
        }

        const stripeData = event as any;
        const paymentIntentObj = stripeData.data?.object;
        const paymentIntent = paymentIntentObj?.id;
        console.log("paymentIntent recibido:", paymentIntent);
        console.log("llegando al webhook, tipo:", stripeData.type);

        if (stripeData.type === "payment_intent.succeeded") {
        console.log("Payment successful...");

        await stripeService.handlePaymentIntentEvent(stripeData);

        const paymentId =
            paymentIntentObj?.metadata?.paymentId ||
            paymentIntentObj?.metadata?.donationId ||
            null;
        const amount = paymentIntentObj?.amount_received
            ? paymentIntentObj.amount_received / 100
            : null;

        if (paymentId && amount) {
            try {
            console.log(
                "Registrando/actualizando pago para id:",
                paymentId,
                "monto:",
                amount
            );
            await stripeService.updatePayment(paymentId);
            } catch (err) {
            console.warn("Error actualizando registro de pago:", err);
            }
        }

        console.log("Envío de notificaciones post-pago (si aplica)");
        }

        if (stripeData.type === "payment_intent.requires_action") {
        console.log("Payment requires action...");
        }

        return res.status(200).send({ status: 200, message: "All Good!" });
    } catch (error) {
        console.log("Error en el webhook: ", error);
        return res.status(200).send({ status: 200, message: "Ocurrió un error..." });
    }
}