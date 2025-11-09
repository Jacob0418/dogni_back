import { connect, getMongoId } from "../../shared/database/mongodb";
import { BaseError } from "../../shared/classes/base-error";
import { ObjectId } from "mongodb";

export interface Certificate {
    _id?: string;
    img?: string;
    foundationId: string;
    title: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

type CertificateDB = Omit<Certificate, "_id"> & { _id?: ObjectId };

export async function createCertificate(certificateData: Certificate): Promise<string> {
    try {
        const database = await connect();
        const collection = database.collection<CertificateDB>("certificate");
        const newCertificate: any = {
            ...certificateData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await collection.insertOne(newCertificate);
        return result.insertedId.toHexString();
    } catch (error) {
        throw new BaseError({ error: error, methodName: "createCertificate", log: "Error creating certificate" });
    }
}

export async function getCertificates(): Promise<Certificate[]> {
    try {
        const database = await connect();
        const collection = database.collection<CertificateDB>("certificate");
        const certificates = await collection.find().toArray();
        return certificates.map((doc) => ({ ...doc, _id: doc._id?.toString() }));
    } catch (error) {
        throw new BaseError({ error: error, methodName: "getCertificates", log: "Error getting certificates" });
    }
}

export async function deleteCertificate(certificateId: string): Promise<void> {
    try {
        const database = await connect();
        const collection = database.collection("certificate");
        const mongoId = getMongoId(certificateId);
        await collection.deleteOne({ _id: mongoId });
    } catch (error) {
        throw new BaseError({ error: error, methodName: "deleteCertificate", log: "Error deleting certificate" });
    }
}

export async function updateCertificate(certificateId: string, updateData: Partial<Certificate>): Promise<void> {
    try {
        const database = await connect();
        const collection = database.collection("certificate");
        const mongoId = getMongoId(certificateId);
        const updateFields: any = { ...updateData, updatedAt: new Date() };
        await collection.updateOne({ _id: mongoId }, { $set: updateFields });
    } catch (error) {
        throw new BaseError({ error: error, methodName: "updateCertificate", log: "Error updating certificate" });
    }
}

export async function getCertificateById(certificateId: string): Promise<Certificate | null> {
    try {
        const database = await connect();
        const collection = database.collection<CertificateDB>("certificate");
        const doc = await collection.findOne({ _id: getMongoId(certificateId) });
        if (!doc) return null;
        const certificate: Certificate = { ...doc, _id: doc._id?.toString() };
        return certificate;
    } catch (error) {
        throw new BaseError({ error: error, methodName: "getCertificateById", log: "Error getting certificate by ID" });
    }
}

export async function awardCertificateIfFirstDonationFromTemplate(
    donorUid: string,
    foundationId: string,
    paymentIntentId?: string,
    amount?: number
    ) {
    try {
        if (!donorUid || !foundationId) return false;

        const db = await connect();
        const donationsCol = db.collection("donations");
        const succeededCount = await donationsCol.countDocuments({
            donorUid,
            foundationId,
            status: "succeeded",
        });
        if (succeededCount !== 1) return false;
        const certificatesCol = db.collection("certificates");
        const template = await certificatesCol.findOne({ foundationId });

        if (!template) {
            return false;
        }
        const userCertEntry: any = {
            certificateId: template._id,
            title: template.title,
            description: template.description,
            foundationId,
            paymentIntentId: paymentIntentId ?? null,
            amount: amount ?? null,
            awardedAt: new Date(),
        };

        const usersCol = db.collection("users");
        await usersCol.updateOne(
            { uid: donorUid },
            {
                $push: { certificates: userCertEntry },
                $set: { updatedAt: new Date() },
            }
        );

        return true;
    } catch (error) {
        throw new BaseError({
            error,
            methodName: "awardCertificateIfFirstDonationFromTemplate",
            log: "Error awarding certificate from template",
        });
    }
}