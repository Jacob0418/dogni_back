import { Request, Response, NextFunction } from "express";
import * as stripeService from "./stripeService";

export async function createDonationIntentController(req: Request, res: Response, next: NextFunction) {
    try {
        const { foundationId, amount, donorUid, donorEmail, currency } = req.body;
        if (!foundationId || !amount) {
            return res.status(400).json({ message: "foundationId and amount are required" });
        }

        const result = await stripeService.createDonationIntent(
            foundationId,
            Number(amount),
            donorUid,
            donorEmail,
            currency
        );

        return res.status(201).json({
            success: true,
            clientSecret: result.clientSecret,
            donationId: result.donationId,
            paymentIntent: result.paymentIntent,
        });
    } catch (err) {
        next(err);
    }
}

export async function updateDonationIntentController(req: Request, res: Response, next: NextFunction) {
    try {
        const paymentIntentId = req.params.paymentIntentId || req.body.paymentIntentId;
        const amount = req.body.amount;
        if (!paymentIntentId || !amount) {
            return res.status(400).json({ message: "paymentIntentId and amount are required" });
        }

        const paymentIntent = await stripeService.updateDonationIntent(paymentIntentId, Number(amount));
        return res.status(200).json({ success: true, paymentIntent });
    } catch (err) {
        next(err);
    }
}

export async function getPaymentIntentController(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: "paymentIntent id required" });
        const pi = await stripeService.getPaymentIntent(id);
        return res.status(200).json(pi);
    } catch (err) {
        next(err);
    }
}

export async function getPaymentMethodController(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: "paymentMethod id required" });
        const pm = await stripeService.getPaymentMethod(id);
        return res.status(200).json(pm);
    } catch (err) {
        next(err);
    }
}