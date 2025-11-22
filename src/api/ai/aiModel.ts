import { connect } from "../../shared/database/mongodb";
import { BaseError } from "../../shared/classes/base-error";
import { ObjectId } from "mongodb";

export interface AIimage {
    _id?: string;
    userId: string;
    imagesGenerated: number;
    resetDate: Date; 
    createdAt?: Date;
    updatedAt?: Date;
}

type AIimageDB = Omit<AIimage, "_id"> & { _id?: ObjectId };

const MAX_IMAGES_PER_DAY = 2;

function hasPassed24Hours(resetDate: Date): boolean {
    const now = new Date();
    return now >= resetDate;
}

function getNextResetDate(): Date {
    const now = new Date();
    const resetDate = new Date(now);
    resetDate.setHours(resetDate.getHours() + 24);
    return resetDate;
}

export async function canUserGenerateImage(userId: string): Promise<boolean> {
    try {
        const database = await connect();
        const collection = database.collection<AIimageDB>("ai_image");
        const userDoc = await collection.findOne({ userId });

        if (!userDoc) {
            return true;
        }

        if (hasPassed24Hours(userDoc.resetDate)) {
            return true;
        }

        return userDoc.imagesGenerated < MAX_IMAGES_PER_DAY;
    } catch (error) {
        throw new BaseError({ 
            error, 
            methodName: "canUserGenerateImage", 
            log: "Error verificando límite de imágenes" 
        });
    }
}

export async function recordImageGeneration(userId: string): Promise<void> {
    try {
        const database = await connect();
        const collection = database.collection<AIimageDB>("ai_image");
        const userDoc = await collection.findOne({ userId });
        const now = new Date();

        if (!userDoc) {
            await collection.insertOne({
                userId,
                imagesGenerated: 1,
                resetDate: getNextResetDate(),
                createdAt: now,
                updatedAt: now
            } as any);
            return;
        }

        if (hasPassed24Hours(userDoc.resetDate)) {
            await collection.updateOne(
                { userId },
                {
                    $set: {
                        imagesGenerated: 1,
                        resetDate: getNextResetDate(),
                        updatedAt: now
                    }
                }
            );
            return;
        }
        
        await collection.updateOne(
            { userId },
            {
                $inc: { imagesGenerated: 1 },
                $set: { 
                    resetDate: getNextResetDate(), 
                    updatedAt: now 
                }
            }
        );
    } catch (error) {
        throw new BaseError({ 
            error, 
            methodName: "recordImageGeneration", 
            log: "Error registrando generación de imagen" 
        });
    }
}

export async function getGenerationStatus(userId: string) {
    try {
        const database = await connect();
        const collection = database.collection<AIimageDB>("ai_image");
        const userDoc = await collection.findOne({ userId });
        const now = new Date();

        if (!userDoc) {
            return {
                canGenerate: true,
                remainingGenerations: 2,
                maxGenerations: 2,
                resetDate: getNextResetDate(),
                message: "Puedes generar 2 imágenes"
            };
        }

        if (hasPassed24Hours(userDoc.resetDate)) {
            return {
                canGenerate: true,
                remainingGenerations: 2,
                maxGenerations: 2,
                resetDate: getNextResetDate(),
                message: "Límite reiniciado, puedes generar 2 imágenes"
            };
        }

        const remaining = MAX_IMAGES_PER_DAY - userDoc.imagesGenerated;
        const canGenerate = remaining > 0;

        const resetDateFormatted = userDoc.resetDate.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        return {
            canGenerate,
            remainingGenerations: remaining,
            maxGenerations: MAX_IMAGES_PER_DAY,
            resetDate: userDoc.resetDate,
            message: canGenerate 
                ? `Te quedan ${remaining} imagen(es)` 
                : `Límite alcanzado. Podrás generar más después del ${resetDateFormatted}`
        };
    } catch (error) {
        throw new BaseError({ 
            error, 
            methodName: "getGenerationStatus", 
            log: "Error obteniendo estado de generación" 
        });
    }
}
