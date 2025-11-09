import { Request, Response, NextFunction } from "express";
import * as service from "./userService";
import { HttpStatusCode } from "../../shared/models/http.model";

export async function createUserController(req: Request, res: Response, next: NextFunction) {
    try {
        const payload = req.body;
        console.log("Payload received in controller:", payload);
        const insertedId = await service.createUserService(payload);
        return res.status(200).send({ status: HttpStatusCode.OK, message: "User created successfully", data: insertedId });
    } catch (err) {
        next(err);
    }
}

export async function getAllUsersController(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await service.getAllUsersService();
        return res.status(200).send({ status: HttpStatusCode.OK, message: "Users retrieved successfully", data: users });
    } catch (err) {
        next(err);
    }
}

export async function getUserByIdController(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id;
        const user = await service.getUserByIdService(id);
        if (!user) return res.status(404).send({ status: HttpStatusCode.NOT_FOUND, message: "User not found" });
        return res.status(200).send({ status: HttpStatusCode.OK, message: "User retrieved successfully", data: user });
    } catch (err) {
        next(err);
    }
}

export async function updateUserController(req: Request, res: Response, next: NextFunction) {
    try {
        const uid = req.params.uid;
        const updateData = req.body;
        const ok = await service.updateUserService(uid, updateData);
        return res.status(ok ? 200 : 400).send({ status: ok ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST, message: ok ? "User updated successfully" : "Error updating user" });
    } catch (err) {
        next(err);
    }
}

export async function deleteUserByUidController(req: Request, res: Response, next: NextFunction) {
    try {
        const uid = req.params.uid;
        const ok = await service.deleteUserByUidService(uid);
        return res.status(ok ? 200 : 404).send({ status: ok ? HttpStatusCode.OK : HttpStatusCode.NOT_FOUND, message: ok ? "User deleted successfully" : "Error deleting user" });
    } catch (err) {
        next(err);
    }
}

export async function deleteUserByIdController(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id;
        const ok = await service.deleteUserByIdService(id);
        return res.status(ok ? 200 : 404).send({ status: ok ? HttpStatusCode.OK : HttpStatusCode.NOT_FOUND, message: ok ? "User deleted successfully" : "Error deleting user" });
    } catch (err) {
        next(err);
    }
}

export async function getCertificateByUidController(req: Request, res: Response, next: NextFunction) {
    try {
        const uid = req.params.uid;
        const certificate = await service.getCertificateByUidService(uid);
        if (!certificate) {
            return res.status(404).send({ status: HttpStatusCode.NOT_FOUND, message: "Certificate not found" });
        }
        return res.status(200).send({ status: HttpStatusCode.OK, message: "Certificate retrieved successfully", data: certificate });
    } catch (err) {
        next(err);
    }
}