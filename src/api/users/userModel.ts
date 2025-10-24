import { connect, getMongoId } from "../../shared/database/mongodb";
import { BaseError } from "../../shared/classes/base-error";
import { ObjectId } from "mongodb";
import { auth } from "../../shared/database/firebase";

const firebaseAuth = auth();

export interface User {
    _id?: string;
    name: string;
    email: string;
    role: "admin" | "user";
    uid?: string;
    photoUrl?: string;
    lastName?: string;
    status?: "Activo" | "Inactivo";
    stripeCustomerId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserCreate {
    _id?: string;
    name: string;
    email: string;
    password: string;
    role: "admin" | "user";
    uid?: string;
    photoUrl?: string;
    lastName?: string;
}

type UserDB = Omit<User, "_id"> & { _id?: ObjectId };

export async function createUser(user: UserCreate): Promise<string> {
    try {
        const database = await connect();
        const collection = database.collection("users");
        const { password, _id, ...rest } = user;
        const userData: any = {
            ...rest,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        if (_id) {
            userData._id = getMongoId(_id);
        }

        const result = await collection.insertOne(userData);
        return result.insertedId.toString();
    } catch (error) {
        throw new BaseError({ error, methodName: "createUser", log: "Error creating user" });
    }
}

export async function createAuth(email: string, password: string, displayName: string) {
    try {
        const userRecord = await firebaseAuth.createUser({
            email,
            password,
            displayName,
            emailVerified: false,
            photoURL: "https://firebasestorage.googleapis.com/v0/b/ankyra-a7868.appspot.com/o/profile_placeholder.png?alt=media&token=9a26e099-ecde-4289-8570-6037a98e08dc",
        });
        await firebaseAuth.setCustomUserClaims(userRecord.uid, { status: "Inactivo" });
        return userRecord;
    } catch (error: any) {
        if (error?.errorInfo?.code === "auth/email-already-exists") {
            throw new BaseError({ error, methodName: "createAuth", log: "El correo electrónico ingresado ya fue registrado anteriormente" });
        }
        throw new BaseError({ error, methodName: "createAuth", log: "Error creating firebase auth user" });
    }
}

export async function getUserById(userId: string): Promise<User | null> {
    try {
        const database = await connect();
        const collection = database.collection<UserDB>("users");
        const doc = await collection.findOne({ _id: getMongoId(userId) });
        if (!doc) return null;
        return { ...doc, _id: doc._id?.toString() };
    } catch (error) {
        throw new BaseError({ error, methodName: "getUserById", log: "Error getting user by id" });
    }
}

export async function updateUser(userUid: string, user: Partial<User>): Promise<boolean> {
    try {
        const database = await connect();
        const collection = database.collection<UserDB>("users");

        const currentUser = await collection.findOne({ uid: userUid });

        const { password, ...updateFields } = user as any;

        const updateResult = await collection.updateOne(
            { uid: userUid },
            { $set: { ...updateFields, updatedAt: new Date() } }
        );

        if (updateResult.modifiedCount && (user.email || user.photoUrl || user.name)) {
            await firebaseAuth.updateUser(userUid, {
                email: user.email,
                photoURL: user.photoUrl,
                displayName: user.name,
            });
        }

        return updateResult.modifiedCount > 0;
    } catch (error) {
        throw new BaseError({ error, methodName: "updateUser", log: "Error updating user" });
    }
}

export async function deleteUserUid(uid: string): Promise<boolean> {
    try {
        await firebaseAuth.deleteUser(uid);

        const database = await connect();
        const collection = database.collection("users");
        const response = await collection.deleteOne({ uid: uid });

        return response.deletedCount > 0;
    } catch (error) {
        throw new BaseError({ error, methodName: "deleteUserUid", log: "Error deleting user by uid" });
    }
}

export async function deleteUser(userId: string): Promise<boolean> {
    try {
        const database = await connect();
        const collection = database.collection<UserDB>("users");

        const doc = await collection.findOne({ _id: getMongoId(userId) });
        if (!doc) return false;

        if ((doc as any).uid) {
            try {
                await firebaseAuth.deleteUser((doc as any).uid);
            } catch (err) {
                console.warn("Firebase deleteUser failed:", err);
            }
        }

        const response = await collection.deleteOne({ _id: getMongoId(userId) });
        return response.deletedCount > 0;
    } catch (error) {
        throw new BaseError({ error, methodName: "deleteUser", log: "Error deleting user by id" });
    }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        const database = await connect();
        const collection = database.collection<UserDB>("users");
        const users = await collection.find().toArray();
        return users.map((doc) => ({ ...doc, _id: doc._id?.toString() }));
    } catch (error) {
        throw new BaseError({ error, methodName: "getAllUsers", log: "Error getting all users" });
    }
}