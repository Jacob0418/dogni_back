import * as admin from "firebase-admin";
import { connect, getMongoId } from "../database/mongodb";
import { BaseError } from "../classes/base-error";

export async function sendDonationSuccessNotification(
    donorUid: string,
    title: string,
    body: string,
    data?: Record<string, string>
){
    try {
        const db = await connect();
        const usersCol = db.collection("users");
        const user = await usersCol.findOne({ uid: donorUid });
        if (!user) return false;

        const tokens: string[] = Array.isArray(user.fcmTokens) ? user.fcmTokens : (user.fcmToken ? [user.fcmToken] : []);
        if (!tokens || tokens.length === 0) return false;

        const message = {
            notification: { title, body },
            data: data ?? {},
            tokens,
        };

        const resp = await admin.messaging().sendMulticast(message);
        const invalidTokenIndexes: number[] = [];
        resp.responses.forEach((r, idx) => {
            if (!r.success) {
                const err = r.error;
                if (err && (err.code === "messaging/invalid-registration-token" || err.code === "messaging/registration-token-not-registered")) {
                invalidTokenIndexes.push(idx);
                }
            }
        });

        if (invalidTokenIndexes.length > 0) {
            const badTokens = invalidTokenIndexes.map(i => tokens[i]);
            await usersCol.updateOne(
                { uid: donorUid },
                { $pull: { fcmTokens: { $in: badTokens } }, $set: { updatedAt: new Date() } }
            );
        }

        return true;
    } catch (error) {
        throw new BaseError({ error, methodName: "sendDonationSuccessNotification", log: "" });
    }
}