import { Pet, createPet, getPetById, getPetsByOwner, updatePet, deletePet, getPets } from "./petModel";
import { BaseError } from "../../shared/classes/base-error";
import { ParametersError } from "../../shared/classes/api-errors";
import { HttpStatusCode } from "../../shared/models/http.model";

export async function serviceCreatePet(petData: Pet): Promise<Pet> {
    try {
        if (!petData.photoUrl || !petData.name || !petData.breed || !petData.birthdate ||
            !petData.gender || !petData.ownerId) {
            throw new ParametersError("Missing required pet fields");
        }
        const newPet = await createPet(petData);
        return newPet;
    } catch (error) {
        if (error instanceof ParametersError) {
            throw error;
        }
        throw new BaseError({ error, methodName: "serviceCreatePet", log: "Error creating pet" });
    }
}

export async function serviceGetPetsByOwner(ownerId: string): Promise<Pet[]> {
    try {
        if (!ownerId) {
            throw new ParametersError("Missing required owner ID");
        }
        const pets = await getPetsByOwner(ownerId);
        return pets;
    } catch (error) {
        if (error instanceof ParametersError) {
            throw error;
        }
        throw new BaseError({ error, methodName: "serviceGetPetsByOwner", log: "Error getting pets by owner" });
    }
}

export async function serviceGetPetById(petId: string): Promise<Pet | null> {
    try {
        if (!petId) {
            throw new ParametersError("Missing required pet ID");
        }
        const pet = await getPetById(petId);
        return pet;
    } catch (error) {
        if (error instanceof ParametersError) {
            throw error;
        }
        throw new BaseError({ error, methodName: "serviceGetPetById", log: "Error getting pet by ID" });
    }
}

export async function serviceUpdatePet(petId: string, updateData: Partial<Pet>): Promise<void> {
    try {
        if (!petId) {
            throw new ParametersError("Missing required pet ID");
        }
        await updatePet(petId, updateData);
    } catch (error) {
        if (error instanceof ParametersError) {
            throw error;
        }
        throw new BaseError({ error, methodName: "serviceUpdatePet", log: "Error updating pet" });
    }
}

export async function serviceDeletePet(petId: string): Promise<void> {
    try {
        if (!petId) {
            throw new ParametersError("Missing required pet ID");
        }
        await deletePet(petId);
    } catch (error) {
        if (error instanceof ParametersError) {
            throw error;
        }
        throw new BaseError({ error, methodName: "serviceDeletePet", log: "Error deleting pet" });
    }
}

export async function serviceGetPets(): Promise<Pet[]> {
    try {
        const pets = await getPets();
        return pets;
    } catch (error) {
        throw new BaseError({ error, methodName: "serviceGetPets", log: "Error getting pets" });
    }
}