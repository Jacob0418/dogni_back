import express, { NextFunction } from "express";
import { HttpStatusCode } from "../../shared/models/http.model";
import * as certificateService from "./certificateService";
import { Certificate } from "./certicateModel";
import { ParametersError } from "../../shared/classes/api-errors";

export async function createCertificateController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const certificateData: Certificate = req.body;
        const certificateId = await certificateService.serviceCreateCertificate(certificateData);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Certificate created successfully", data: certificateId });
    } catch (error) {
        next(error);
    }
}

export async function getCertificatesController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const certificates = await certificateService.serviceGetCertificates();
        res.status(200).send({ status: HttpStatusCode.OK, message: "Certificates retrieved successfully", data: certificates });
    } catch (error) {
        next(error);
    }
}

export async function updateCertificateController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const certificateId = req.params.id;
        const updateData: Partial<Certificate> = req.body;
        await certificateService.serviceUpdateCertificate(certificateId, updateData);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Certificate updated successfully" });
    } catch (error) {
        next(error);
    }
}

export async function deleteCertificateController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const certificateId = req.params.id;
        await certificateService.serviceDeleteCertificate(certificateId);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Certificate deleted successfully" });
    } catch (error) {
        next(error);
    }
}

export async function getCertificateByIdController(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    try {
        const certificateId = req.params.id;
        const certificate = await certificateService.serviceGetCertificateById(certificateId);
        res.status(200).send({ status: HttpStatusCode.OK, message: "Certificate retrieved successfully", data: certificate });
    } catch (error) {
        next(error);
    }
}