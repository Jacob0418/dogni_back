import * as admin from "firebase-admin";
import { connect } from "../database/mongodb";
import { BaseError } from "../classes/base-error";

export async function sendDonationSuccessNotification(
  donorUid: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<boolean> {
  try {
    if (!admin || !admin.messaging) {
      console.warn("Firebase admin no inicializado - no se enviará notificación FCM");
      return false;
    }

    const db = await connect();
    const usersCol = db.collection("users");
    const user = await usersCol.findOne({ uid: donorUid });
    if (!user) {
      console.log("Usuario no encontrado para uid:", donorUid);
      return false;
    }

    const tokens: string[] = Array.isArray(user.fcmTokens)
      ? user.fcmTokens
      : (user.fcmToken ? [user.fcmToken] : []);

    console.log("Enviando FCM a tokens (para uid):", donorUid, tokens);
    if (!tokens.length) return false;

    const message = {
      notification: { title, body },
      data,
      tokens,
    };

    const resp = await admin.messaging().sendMulticast(message);
    console.log("FCM resp:", resp);

    const badTokens: string[] = [];
    resp.responses.forEach((r, i) => {
      if (!r.success) {
        const err = (r as any).error;
        if (err && (err.code === "messaging/invalid-registration-token" || err.code === "messaging/registration-token-not-registered")) {
          badTokens.push(tokens[i]);
        }
      }
    });

    if (badTokens.length) {
      await usersCol.updateOne(
        { uid: donorUid },
        { $pull: { fcmTokens: { $in: badTokens } }, $set: { updatedAt: new Date() } }
      );
      console.log("Tokens inválidos removidos:", badTokens);
    }

    return true;
  } catch (error) {
    console.error("sendDonationSuccessNotification error:", error);
    throw new BaseError({ error, methodName: "sendDonationSuccessNotification", log: "" });
  }
}