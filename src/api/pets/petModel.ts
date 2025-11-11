import { connect, getMongoId } from "../../shared/database/mongodb";
import { BaseError } from "../../shared/classes/base-error";
import { ObjectId } from "mongodb";

export interface Pet {
    id?: string;
    photoUrl: string;
    name: string;
    breed: string;
    birthdate: string;
    gender: 'male' | 'female';
    ownerId: string;
}

export async function createPet(pet: Pet): Promise<Pet> {
    try {
        const database = await connect();
        const collection = database.collection("pets");
        const { id, ...rest } = pet;
        const petData: any = {
            ...rest,
            ownerId: getMongoId(rest.ownerId)
        };

        if (id) {
            petData._id = getMongoId(id);
        }
        const result = await collection.insertOne(petData);
        return {
            ...pet,
            id: result.insertedId.toHexString()
        };
    } catch (error) {
        throw new BaseError({ error, methodName: "createPet", log: "Error creating pet" });
    }
}

export async function getPetsByOwner(ownerId: string): Promise<Pet[]> {
    try {
        const database = await connect();
        const collection = database.collection<Pet>("pets");
        const pets = await collection.find({ ownerId }).toArray();
        return pets.map((doc) => ({
            ...doc,
            id: (doc as any)._id.toString()
        }));
    } catch (error) {
        throw new BaseError({ error, methodName: "getPetsByOwner", log: "Error getting pets by owner" });
    }
}

export async function getPetById(petId: string): Promise<Pet | null> {
    try {
        const database = await connect();
        const collection = database.collection<Pet>("pets");
        const pet = await collection.findOne({ _id: getMongoId(petId) });
        if (pet) {
            return {
                ...pet,
                id: (pet as any)._id.toString()
            };
        }
        return null;
    } catch (error) {
        throw new BaseError({ error, methodName: "getPetById", log: "Error getting pet by id" });
    }
}

export async function updatePet(petId: string, updateData: Partial<Pet>): Promise<void> {
    try {
        const database = await connect();
        const collection = database.collection("pets");
        await collection.updateOne({ _id: getMongoId(petId) }, { $set: updateData });
    } catch (error) {
        throw new BaseError({ error, methodName: "updatePet", log: "Error updating pet" });
    }
}

export async function deletePet(petId: string): Promise<void> {
    try {
        const database = await connect();
        const collection = database.collection("pets");
        await collection.deleteOne({ _id: getMongoId(petId) });
    } catch (error) {
        throw new BaseError({ error, methodName: "deletePet", log: "Error deleting pet" });
    }
}

export async function getPets(): Promise<Pet[]> {
    try {
        const database = await connect();
        const collection = database.collection<Pet>("pets");
        const pets = await collection.find().toArray();
        return pets.map((doc) => ({
            ...doc,
            id: (doc as any)._id.toString()
        }));
    } catch (error) {
        throw new BaseError({ error, methodName: "getPets", log: "Error getting pets" });
    }
}