import { connect, getMongoId } from "../../shared/database/mongodb";
import { BaseError } from "../../shared/classes/base-error";
import { ObjectId } from "mongodb";

export interface Foundation {
    _id?: string;
    name: string;
    description: string;
    address: Address;
    phone: string;
    email: string;
    logoUrl?: string;
    posterUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Address {
    country: string;
    state: string;
    city: string;
    street?: string;
    zipCode: string;
    lat?: number;
    lng?: number;
}

type FoundationDB = Omit<Foundation, "_id"> & { _id?: ObjectId };

export async function createFoundation(foundation: Foundation): Promise<string> {
    try {
        const database = await connect();
        const collection = database.collection("foundation");

        const { _id, ...rest } = foundation;
        const foundationData: any = {
            ...rest,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (_id) {
            foundationData._id = getMongoId(_id);
        }

        const responseCreate = await collection.insertOne(foundationData);
        return responseCreate.insertedId.toString();
    } catch (error) {
        throw new BaseError({ error: error, methodName: "createFoundation", log: "Error creating foundation" });
    }
}

export async function getFoundations(): Promise<Foundation[]> {
    try {
        const database = await connect();
        const collection = database.collection<FoundationDB>("foundation");
        const foundations = await collection.find().toArray();
        return foundations.map((doc) => ({ ...doc, _id: doc._id?.toString() }));
    } catch (error) {
        throw new BaseError({ error: error, methodName: "getFoundations", log: "Error getting foundations" });
    }
}

export async function getFoundationById(foundationId: string): Promise<Foundation | null> {
    try {
        const database = await connect();
        const collection = database.collection<FoundationDB>("foundation");
        const doc = await collection.findOne({ _id: getMongoId(foundationId) });
        if (!doc) return null;
        const foundation: Foundation = { ...doc, _id: doc._id?.toString() };
        return foundation;
    } catch (error) {
        throw new BaseError({ error: error, methodName: "getFoundationById", log: "Error getting foundation by ID" });
    }
}

export async function updateFoundation(foundationId: string, updateData: Partial<Foundation>): Promise<void> {
    try {
        const database = await connect();
        const collection = database.collection("foundation");
        await collection.updateOne({ _id: getMongoId(foundationId) }, { $set: updateData });
    } catch (error) {
        throw new BaseError({ error: error, methodName: "updateFoundation", log: "Error updating foundation" });
    }
}

export async function deleteFoundation(foundationId: string): Promise<void> {
    try {
        const database = await connect();
        const collection = database.collection("foundation");
        await collection.deleteOne({ _id: getMongoId(foundationId) });
    } catch (error) {
        throw new BaseError({ error: error, methodName: "deleteFoundation", log: "Error deleting foundation" });
    }
}