import { connect, getMongoId } from "../../shared/database/mongodb";
import { BaseError } from "../../shared/classes/base-error";
import { ParametersError } from "../../shared/classes/api-errors";
import { HttpStatusCode } from "../../shared/models/http.model";
import { ObjectId } from "mongodb";
import { awardCertificateIfFirstDonationFromTemplate } from "../certificates/certificateModel";

export interface Donation {
    _id?: string;
    donorUid?: string;
    donorEmail?: string;
    foundationId: string;
    amount: number;
    currency?: string;
    paymentIntentId?: string;
    status?: "pending" | "succeeded" | "requires_payment_method" | "failed";
    createdAt?: Date;
    updatedAt?: Date;
}

type DonationDB = Omit<Donation, "_id"> & { _id?: ObjectId };

const stripeKey =
    process.env.NODE_ENV === "production"
        ? process.env.STRIPE_PROD_SECRET_KEY
        : process.env.STRIPE_TEST_SECRET_KEY;

if (!stripeKey) {
    throw new Error("Stripe secret key is not defined in environment variables");
}

const stripe = require("stripe")(stripeKey);

export async function createDonationIntent(
    foundationId: string,
    amount: number,
    donorUid?: string,
    donorEmail?: string,
    currency = "MXN"
) {
    if (!foundationId || !amount || amount <= 0) {
        throw new ParametersError(
        "Missing parameters",
        "createDonationIntent",
        HttpStatusCode.BAD_REQUEST,
        );
    }

    try {
        const amountInCents = Math.round(amount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        description: `Donation to foundation ${foundationId}`,
        metadata: {
            foundationId,
            donorUid: donorUid ?? "",
            donorEmail: donorEmail ?? "",
            purpose: "donation",
        },
        payment_method_types: ["card"],
        });

        const database = await connect();
        const collection = database.collection("donations");
        const donationDoc: any = {
        foundationId,
        donorUid,
        donorEmail,
        amount,
        currency,
        paymentIntentId: paymentIntent.id,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        };

        const result = await collection.insertOne(donationDoc);

        return {
        clientSecret: paymentIntent.client_secret,
        paymentIntent,
        donationId: result.insertedId.toString(),
        };
    } catch (error) {
        throw new BaseError({ error, methodName: "createDonationIntent", log: "Error creating donation intent" });
    }
}

export async function updateDonationIntent(paymentIntentId: string, amount: number) {
    if (!paymentIntentId || !amount || amount <= 0) {
        throw new ParametersError(
        "Missing parameters",
        "updateDonationIntent",
        HttpStatusCode.BAD_REQUEST,
        );
    }

    try {
        const amountInCents = Math.round(amount * 100);

        const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount: amountInCents,
        });

        const database = await connect();
        const collection = database.collection("donations");
        await collection.updateOne(
        { paymentIntentId },
        { $set: { amount: amount, updatedAt: new Date() } }
        );

        return paymentIntent;
    } catch (error) {
        throw new BaseError({ error, methodName: "updateDonationIntent", log: "Error updating donation intent" });
    }
}

export async function getPaymentIntent(paymentIntentId: string) {
    if (!paymentIntentId) {
        throw new ParametersError(
        "Missing parameters",
        "getPaymentIntent",
        HttpStatusCode.BAD_REQUEST
        );
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        throw new BaseError({ error, methodName: "getPaymentIntent", log: "Error retrieving payment intent" });
    }
}

export async function getPaymentMethod(paymentMethodId: string) {
    if (!paymentMethodId) {
        throw new ParametersError(
        "Missing parameters",
        "getPaymentMethod",
        HttpStatusCode.BAD_REQUEST
        );
    }

    try {
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        return paymentMethod;
    } catch (error) {
        throw new BaseError({ error, methodName: "getPaymentMethod", log: "Error retrieving payment method" });
    }
}

export async function handlePaymentIntentEvent(event: any) {
    try {
        const pi = event.data?.object;
        if (!pi || !pi.id) throw new Error("Invalid Stripe event data");

        const status: Donation["status"] =
        pi.status === "succeeded" ? "succeeded" :
        pi.status === "requires_payment_method" ? "requires_payment_method" :
        pi.status === "processing" ? "pending" :
        "failed";

        const database = await connect();
        const collection = database.collection("donations");

        await collection.updateOne(
        { paymentIntentId: pi.id },
        {
            $set: {
            status,
            updatedAt: new Date(),
            },
            $setOnInsert: {
            paymentIntentId: pi.id,
            amount: (pi.amount && typeof pi.amount === "number") ? (pi.amount / 100) : undefined,
            currency: pi.currency,
            createdAt: new Date(),
            },
        },
        { upsert: true }
        );

        // if (pi.status === "succeeded") {
        //     const donorUid = pi.metadata?.donorUid ?? null;
        //     const foundationId = pi.metadata?.foundationId ?? null;
        //     const amount = (pi.amount_received && typeof pi.amount_received === "number") ? (pi.amount_received / 100) : undefined;

        //     if (donorUid && foundationId) {
        //         try {
        //         await awardCertificateIfFirstDonationFromTemplate(donorUid, foundationId, pi.id, amount);
        //         } catch (err) {
        //         console.warn("awardCertificateIfFirstDonationFromTemplate error:", err);
        //         }
        //     }
        // }

        return true;
    } catch (error) {
        throw new BaseError({ error, methodName: "handlePaymentIntentEvent", log: "Error handling payment intent event" });
    }
}

export async function updatePayment(paymentId: string) {
    try {
        const database = await connect();
        const deRef = database.collection("payments");

        const paymentStatus = {
        status: "paid",
        paymentDate: new Date().toISOString(),
        };

        await deRef.updateOne(
        { _id: getMongoId(paymentId) },
        { $set: { paymentStatus } }
        );
    } catch (error) {
        throw new BaseError({ error: error, methodName: "updatePayment", log: "" });
    }
}

export async function getDonations(): Promise<Donation[]> {
    try {
        const database = await connect();
        const collection = database.collection<Donation>("donations");
        const donations = await collection.find().toArray();
        return donations.map((doc) => ({ ...doc, _id: doc._id?.toString() }));
    } catch (error) {
        throw new BaseError({ error, methodName: "getDonations", log: "Error retrieving donations" });
    }
}

export async function getDonationById(donationId: string): Promise<Donation | null> {
    try {
        const database = await connect();
        const collection = database.collection<DonationDB>("donations");
        const doc = await collection.findOne({ _id: getMongoId(donationId) });
        if (!doc) return null;
        const donation: Donation = { ...doc, _id: doc._id?.toString() };
        return donation;
    } catch (error) {
        throw new BaseError({ error, methodName: "getDonationById", log: "Error retrieving donation by ID" });
    }
}

export async function getDonationsByFoundationId(foundationId: string): Promise<Donation[]> {
    try {
        const database = await connect();
        const collection = database.collection<DonationDB>("donations");
        const donations = await collection.find({ foundationId }).toArray();
        return donations.map((doc) => ({ ...doc, _id: doc._id?.toString() }));
    } catch (error) {
        throw new BaseError({ error, methodName: "getDonationsByFoundationId", log: "Error retrieving donations by foundation ID" });
    }
}

export async function getDonationsByDonorUid(donorUid: string): Promise<Donation[]> {
    try {
        const database = await connect();
        const collection = database.collection<DonationDB>("donations");
        const donations = await collection.find({ donorUid }).toArray();
        console.log("Donations found for donorUid:", donorUid);
        return donations.map((doc) => ({ ...doc, _id: doc._id?.toString() }));
    } catch (error) {
        throw new BaseError({ error, methodName: "getDonationsByDonorUid", log: "Error retrieving donations by donor UID" });
    }
}