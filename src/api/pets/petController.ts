import express, { NextFunction } from "express";
import { HttpStatusCode } from "../../shared/models/http.model";
import * as petService from "./petService";
import { Pet } from "./petModel";
import { ParametersError } from "../../shared/classes/api-errors";

export async function createPetController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const petData: Pet = req.body;
        const newPet = await petService.serviceCreatePet(petData);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Pet created successfully", data: newPet });
    } catch (error) {
        next(error);
    }
}

export async function getPetsByOwnerController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const ownerId: string = req.params.ownerId;
        const pets = await petService.serviceGetPetsByOwner(ownerId);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Pets retrieved successfully", data: pets });
    } catch (error) {
        next(error);
    }
}

export async function getPetByIdController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const petId: string = req.params.petId;
        const pet = await petService.serviceGetPetById(petId);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Pet retrieved successfully", data: pet });
    } catch (error) {
        next(error);
    }
}

export async function updatePetController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const petId: string = req.params.petId;
        const updateData: Partial<Pet> = req.body;
        await petService.serviceUpdatePet(petId, updateData);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Pet updated successfully" });
    } catch (error) {
        next(error);
    }
}

export async function deletePetController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const petId: string = req.params.petId;
        await petService.serviceDeletePet(petId);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Pet deleted successfully" });
    } catch (error) {
        next(error);
    }
}

export async function getPetsController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const pets = await petService.serviceGetPets();
        res.status(200).send({ status: HttpStatusCode.OK, message: "Pets retrieved successfully", data: pets });
    } catch (error) {
        next(error);
    }
}