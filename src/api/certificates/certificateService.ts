import { BaseError } from "../../shared/classes/base-error";
import { ParametersError } from "../../shared/classes/api-errors";
import { HttpStatusCode } from "../../shared/models/http.model";
import { createCertificate, getCertificates, updateCertificate, deleteCertificate, Certificate, getCertificateById } from "./certificateModel";

export async function serviceCreateCertificate(certificateData: Certificate): Promise<string> {
    try {
        if (!certificateData.title || !certificateData.description) {
            throw new ParametersError("Missing required certificate fields");
        }
        const certificateId = await createCertificate(certificateData);
        return certificateId;
    } catch (error) {
        console.error('Error creating certificate:', error);
        throw error;
    }
}

export async function serviceGetCertificates(): Promise<Certificate[]> {
    try {
        const certificates = await getCertificates();
        return certificates;
    } catch (error) {
        console.error('Error getting certificates:', error);
        throw error;
    }
}

export async function serviceUpdateCertificate(certificateId: string, updateData: Partial<Certificate>): Promise<void> {
    try {
        if (!certificateId) {
            throw new ParametersError("Missing required certificate ID");
        }
        await updateCertificate(certificateId, updateData);
    } catch (error) {
        console.error('Error updating certificate:', error);
        throw error;
    }
}

export async function serviceDeleteCertificate(certificateId: string): Promise<void> {
    try {
        if (!certificateId) {
            throw new ParametersError("Missing required certificate ID");
        }
        await deleteCertificate(certificateId);
    } catch (error) {
        console.error('Error deleting certificate:', error);
        throw error;
    }
}

export async function serviceGetCertificateById(certificateId: string): Promise<Certificate | null> {
    try {
        if (!certificateId) {
            throw new ParametersError("Missing required certificate ID");
        }
        const certificate = await getCertificateById(certificateId);
        return certificate;
    } catch (error) {
        console.error('Error getting certificate by ID:', error);
        throw error;
    }
}