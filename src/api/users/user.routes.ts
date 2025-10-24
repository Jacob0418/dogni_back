import { Router } from "express";
import * as userController from "./userController";

const router = Router();

router.post("/", userController.createUserController);
router.get("/", userController.getAllUsersController);
router.get("/:id", userController.getUserByIdController);
router.put("/uid/:uid", userController.updateUserController);
router.delete("/uid/:uid", userController.deleteUserByUidController);
router.delete("/:id", userController.deleteUserByIdController);

export default router;