import { UserCreate, User } from "./userModel";
import * as model from "./userModel";
import { BaseError } from "../../shared/classes/base-error";

export async function createUserService(payload: UserCreate): Promise<string> {
    try {
        const firebaseUser = await model.createAuth(payload.email, payload.password, payload.name);
        const mongoUser: any = {
            ...payload,
            uid: firebaseUser.uid,
            password: undefined,
        };
        delete mongoUser.password;
        const insertedId = await model.createUser(mongoUser);
        return insertedId;
    } catch (err) {
        throw new BaseError({ error: err, methodName: "createUserService", log: "Error creating user service" });
    }
}

export async function getAllUsersService(): Promise<User[]> {
    try {
        return await model.getAllUsers();
    } catch (err) {
        throw new BaseError({ error: err, methodName: "getAllUsersService", log: "Error getting users" });
    }
}

export async function getUserByIdService(id: string): Promise<User | null> {
    try {
        return await model.getUserById(id);
    } catch (err) {
        throw new BaseError({ error: err, methodName: "getUserByIdService", log: "Error getting user by id" });
    }
}

export async function updateUserService(uid: string, updateData: Partial<User>): Promise<boolean> {
    try {
        // asegurarse de no propagar password
        if ((updateData as any).password) delete (updateData as any).password;
        return await model.updateUser(uid, updateData);
    } catch (err) {
        throw new BaseError({ error: err, methodName: "updateUserService", log: "Error updating user" });
    }
}

export async function deleteUserByUidService(uid: string): Promise<boolean> {
    try {
        return await model.deleteUserUid(uid);
    } catch (err) {
        throw new BaseError({ error: err, methodName: "deleteUserByUidService", log: "Error deleting user by uid" });
    }
}

export async function deleteUserByIdService(id: string): Promise<boolean> {
    try {
        return await model.deleteUser(id);
    } catch (err) {
        throw new BaseError({ error: err, methodName: "deleteUserByIdService", log: "Error deleting user by id" });
    }
}

export async function getCertificateByUidService(uid: string): Promise<User | null> {
    try {
        return await model.getCertificateByUid(uid);
    } catch (err) {
        throw new BaseError({ error: err, methodName: "getCertificateByUidService", log: "Error getting certificate by uid" });
    }
}