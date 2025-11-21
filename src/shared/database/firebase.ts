import * as admin from "firebase-admin";
import { readFileSync } from "fs";

// const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
// const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN!);
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS!;
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
const bucket = process.env.STORAGE_BUCKET;


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount!),
    databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
});

function firestore() {
    try {
        return admin.firestore();
    } catch (error) {
        throw error;
    }
}

function auth() {
    try {
        return admin.auth();
    } catch (error) {
        throw error;
    }
}

function storage() {
    try {
        return admin.storage().bucket(bucket);
    } catch (error) {

    }
}


export {
    firestore,
    auth,
    storage
}