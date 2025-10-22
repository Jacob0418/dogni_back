import express, { NextFunction } from "express";
import { HttpStatusCode } from "../../shared/models/http.model";
import * as foundationService from "./foundationService";
import { Foundation } from "./foundationModel";
import { ParametersError } from "../../shared/classes/api-errors";

export async function createFoundationController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const foundationData: Foundation = req.body;
        const foundationId = await foundationService.serviceCreateFoundation(foundationData);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Entry show successfully", data: foundationId });
    } catch (error) {
        next(error);
    }
}

export async function getFoundationsController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const foundations = await foundationService.serviceGetFoundations();
        res.status(200).send({ status: HttpStatusCode.OK, message: "Foundations retrieved successfully", data: foundations });
    } catch (error) {
        next(error);
    }
}

export async function getFoundationByIdController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const foundationId = req.params.id;
        const foundation = await foundationService.serviceGetFoundationById(foundationId);
        if (!foundation) {
            return res.status(404).send({ status: HttpStatusCode.NOT_FOUND, message: "Foundation not found" });
        }
        res.status(200).send({ status: HttpStatusCode.OK, message: "Foundation retrieved successfully", data: foundation });
    } catch (error) {
        next(error);
    }
}

export async function updateFoundationController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const foundationId = req.params.id;
        const updateData: Partial<Foundation> = req.body;
        await foundationService.serviceUpdateFoundation(foundationId, updateData);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Foundation updated successfully" });
    } catch (error) {
        next(error);
    }
}

export async function deleteFoundationController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const foundationId = req.params.id;
        await foundationService.serviceDeleteFoundation(foundationId);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Foundation deleted successfully" });
    } catch (error) {
        next(error);
    }
}
