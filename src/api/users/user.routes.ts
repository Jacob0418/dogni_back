import { Router } from "express";
import * as userController from "./userController";

const router = Router();

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Crea un usuario
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post("/", userController.createUserController);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Obtiene todos los usuarios
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/", userController.getAllUsersController);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: No encontrado
 */
router.get("/:id", userController.getUserByIdController);

/**
 * @openapi
 * /users/uid/{uid}:
 *   put:
 *     summary: Actualiza un usuario por UID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put("/uid/:uid", userController.updateUserController);

/**
 * @openapi
 * /users/uid/{uid}:
 *   delete:
 *     summary: Elimina un usuario por UID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       204:
 *         description: Eliminado
 */
router.delete("/uid/:uid", userController.deleteUserByUidController);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Elimina un usuario por ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       204:
 *         description: Eliminado
 */
router.delete("/:id", userController.deleteUserByIdController);

export default router;