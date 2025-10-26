import { Request, Response, NextFunction } from "express";
import * as stripeService from "../stripeService";

const stripeKey =
    process.env.NODE_ENV === "production"
        ? process.env.STRIPE_PROD_SECRET_KEY
        : process.env.STRIPE_TEST_SECRET_KEY;

const stripe = require("stripe")(stripeKey);
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function stripeWebhookController(req: Request, res: Response, next: NextFunction) {
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

        await stripeService.handlePaymentIntentEvent(event);
        return res.status(200).send({ received: true });
    } catch (err) {
        next(err);
    }
}