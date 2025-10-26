export interface Donation {
    _id?: string;
    donorUid?: string;
    donorEmail?: string;
    foundationId: string;
    amount: number; // in currency units (e.g. 100.50)
    currency?: string; // default MXN
    paymentIntentId?: string;
    status?: "pending" | "succeeded" | "requires_payment_method" | "failed";
    createdAt?: Date;
    updatedAt?: Date;
}

export type DonationDB = Omit<Donation, "_id"> & { _id?: any };