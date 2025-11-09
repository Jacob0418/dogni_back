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
): Promise<boolean> {
    try {
        console.log("[certificates] awardCertificateIfFirstDonationFromTemplate start", { donorUid, foundationId, paymentIntentId, amount });

        if (!donorUid || !foundationId) {
            console.log("[certificates] missing donorUid or foundationId");
            return false;
        }

        const db = await connect();
        const donationsCol = db.collection("donations");
        const usersCol = db.collection("users");
        const certificatesCol = db.collection("certificate");
        const foundationsCol = db.collection("foundations");

        const donationDoc = await donationsCol.findOne({ paymentIntentId });
        console.log("[certificates] donationDoc found:", !!donationDoc);

        const succeededCount = await donationsCol.countDocuments({
            donorUid,
            foundationId,
            status: "succeeded",
        });

        console.log("[certificates] succeededCount for donor/foundation:", succeededCount);

        if (succeededCount !== 1) {
            console.log("[certificates] Not first succeeded donation -> skipping");
            return false;
        }

        let template = await certificatesCol.findOne({ foundationId: foundationId });
        if (!template) {
            try {
                const maybeId = getMongoId(foundationId);
                template = await certificatesCol.findOne({ foundationId: maybeId });
            } catch (e) {
                
            }
        }

        if (!template) {
            const foundationDoc = await foundationsCol.findOne({
                _id: (() => { try { return getMongoId(foundationId); } catch { return foundationId; } })()
            });
            if (foundationDoc) {
                template = {
                title: `Primer donativo a ${foundationDoc.name}`,
                description: `Gracias por tu primera donación a ${foundationDoc.name}.`,
                } as any;
                console.log("[certificates] No template found, using generated template from foundation:", foundationDoc.name);
            } else {
                console.log("[certificates] No certificate template found and foundation not found -> skipping");
                return false;
            }
        }

        const user = await usersCol.findOne({ uid: donorUid });
        if (!user) {
            console.log("[certificates] User with uid not found:", donorUid);
            return false;
        }

        const issuedCertificatesCol = db.collection("issued_certificates");
        const issuedDoc: any = {
            certificateTemplateId: template._id ?? null,
            donorUid,
            foundationId,
            paymentIntentId: paymentIntentId ?? null,
            amount: amount ?? null,
            title: template.title,
            description: template.description,
            awardedAt: new Date(),
            issuedBy: "system",
        };

        const insertRes = await issuedCertificatesCol.insertOne(issuedDoc);
        console.log("[certificates] issued certificate inserted id:", insertRes.insertedId);

        await usersCol.updateOne(
            { uid: donorUid },
            {
                $push: {
                certificates: {
                    _id: insertRes.insertedId,
                    templateId: template._id ?? null,
                    title: template.title,
                    description: template.description,
                    foundationId,
                    awardedAt: issuedDoc.awardedAt,
                },
                },
                $set: { updatedAt: new Date() },
            }
        );

        console.log("[certificates] certificate reference added to user:", donorUid);
        return true;
    } catch (error) {
        console.error("[certificates] awardCertificateIfFirstDonationFromTemplate error:", error);
        throw new BaseError({
            error,
            methodName: "awardCertificateIfFirstDonationFromTemplate",
            log: "Error awarding certificate from template",
        });
    }
}