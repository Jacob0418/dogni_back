import { getFoundations, createFoundation, getFoundationById, updateFoundation, deleteFoundation } from './foundationModel';
import { BaseError } from "../../shared/classes/base-error";
import { ParametersError } from "../../shared/classes/api-errors";
import { HttpStatusCode } from "../../shared/models/http.model";

export async function serviceCreateFoundation(foundationData: any): Promise<string> {
    try {
        if (!foundationData.name || !foundationData.description || !foundationData.address || !foundationData.phone || !foundationData.email) {
            throw new ParametersError("Missing required foundation fields");
        }
        const foundationId = await createFoundation(foundationData);
        return foundationId;
    } catch (error) {
        console.error('Error creating foundation:', error);
        throw error;
    }
}

export async function serviceGetFoundations(): Promise<any[]> {
    try {
        const foundations = await getFoundations();
        return foundations;
    } catch (error) {
        console.error('Error getting foundations:', error);
        throw error;
    }
}

export async function serviceGetFoundationById(foundationId: string): Promise<any> {
    try {
        if (!foundationId) {
            throw new ParametersError("Missing required foundation ID");
        }
        const foundation = await getFoundationById(foundationId);
        return foundation;
    } catch (error) {
        console.error('Error getting foundation by ID:', error);
        throw error;
    }
}

export async function serviceUpdateFoundation(foundationId: string, updateData: any): Promise<void> {
    try {
        if (!foundationId) {
            throw new ParametersError("Missing required foundation ID");
        }
        await updateFoundation(foundationId, updateData);
    } catch (error) {
        console.error('Error updating foundation:', error);
        throw error;
    }
}

export async function serviceDeleteFoundation(foundationId: string): Promise<void> {
    try {
        if (!foundationId) {
            throw new ParametersError("Missing required foundation ID");
        }
        await deleteFoundation(foundationId);
    } catch (error) {
        console.error('Error deleting foundation:', error);
        throw error;
    }
}
