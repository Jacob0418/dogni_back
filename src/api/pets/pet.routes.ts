import express from "express";
import * as petController from "./petController";

const router = express.Router();

/**
 * @openapi
 * /pets:
 *   post:
 *     summary: Create a new pet
 *     tags:
 *       - Pets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               breed:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum:
 *                   - male
 *                   - female
 *               ownerId:
 *                 type: string
 *             required:
 *               - name
 *               - ownerId
 *     responses:
 *       201:
 *         description: Pet created successfully
 */
router.post("/", petController.createPetController);

/**
 * @openapi
 * /pets/owner/{ownerId}:
 *   get:
 *     summary: Get pets by owner ID
 *     tags:
 *       - Pets
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pet owner
 *     responses:
 *       200:
 *         description: Pets retrieved successfully
 */
router.get("/owner/:ownerId", petController.getPetsByOwnerController);

/**
 * @openapi
 * /pets/{petId}:
 *   get:
 *     summary: Get pet by ID
 *     tags:
 *       - Pets
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pet
 *     responses:
 *       200:
 *         description: Pet retrieved successfully
 */
router.get("/:petId", petController.getPetByIdController);

/**
 * @openapi
 * /pets/{petId}:
 *   put:
 *     summary: Update pet by ID
 *     tags:
 *       - Pets
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               breed:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum:
 *                   - male
 *                   - female
 *               ownerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pet updated successfully
 */
router.put("/:petId", petController.updatePetController);

/**
 * @openapi
 * /pets/{petId}:
 *   delete:
 *     summary: Delete pet by ID
 *     tags:
 *       - Pets
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pet
 *     responses:
 *       200:
 *         description: Pet deleted successfully
 */
router.delete("/:petId", petController.deletePetController);

/**
 * @openapi
 * /pets:
 *   get:
 *     summary: Get all pets
 *     tags:
 *       - Pets
 *     responses:
 *       200:
 *         description: Pets retrieved successfully
 */
router.get("/", petController.getPetsController);

export default router;