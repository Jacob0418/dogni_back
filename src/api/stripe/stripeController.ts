import { Request, Response, NextFunction } from "express";
import * as stripeService from "./stripeService";
import { HttpStatusCode } from "../../shared/models/http.model";
import { connect } from "../../shared/database/mongodb";

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

export async function getDonationsController(req: Request, res: Response, next: NextFunction) {
    try {
        const donations = await stripeService.getDonations();
        return res.status(200).send({ success: HttpStatusCode.OK, message: "Donations retrieved successfully", data: donations });
    } catch (err) {
        next(err);
    }
}

export async function getDonationByIdController(req: Request, res: Response, next: NextFunction) {
    try {
        const donationId = req.params.id;
        if (!donationId) {
            return res.status(400).send({ success: HttpStatusCode.BAD_REQUEST, message: "donationId is required" });
        }
        const donation = await stripeService.getDonationById(donationId);
        if (!donation) {
            return res.status(404).send({ success: HttpStatusCode.NOT_FOUND, message: "Donation not found" });
        }
        return res.status(200).send({ success: HttpStatusCode.OK, message: "Donation retrieved successfully", data: donation });
    } catch (err) {
        next(err);
    }
}

export async function getDonationsByFoundationIdController(req: Request, res: Response, next: NextFunction) {
    try {
        const foundationId = req.params.foundationId;
        if (!foundationId) {
            return res.status(400).send({ success: HttpStatusCode.BAD_REQUEST, message: "foundationId is required" });
        }
        const donations = await stripeService.getDonationsByFoundationId(foundationId);
        return res.status(200).send({ success: HttpStatusCode.OK, message: "Donations retrieved successfully", data: donations });
    } catch (err) {
        next(err);
    }
}

export async function getDonationsByDonorUidController(req: Request, res: Response, next: NextFunction) {
    try {
        const donorUid = req.params.donorUid;
        if (!donorUid) {
            return res.status(400).send({ success: HttpStatusCode.BAD_REQUEST, message: "donorUid is required" });
        }
        const donations = await stripeService.getDonationsByDonorUid(donorUid);
        return res.status(200).send({ success: HttpStatusCode.OK, message: "Donations retrieved successfully", data: donations });
    } catch (err) {
        next(err);
    }
}

export async function registerFcmTokenController(req: Request, res: Response, next: NextFunction) {
    try {
        console.log("registerFcmTokenController called");
        const { uid, token } = req.body;
        console.log("Registering FCM token for uid:", uid, "with token:", token);
        if (!uid || !token) return res.status(400).send("Missing uid or token");

        const db = await connect();
        const user = await db.collection("users").findOne({ uid });
        if (!user) return res.status(404).send("User not found");

        await db.collection("users").updateOne(
            { uid },
            { $addToSet: { fcmTokens: token }, $set: { updatedAt: new Date() } }
        );
        return res.status(200).send({ success: true, message: "Token registered successfully" });
    } catch (error) {
        next(error);
    }
}