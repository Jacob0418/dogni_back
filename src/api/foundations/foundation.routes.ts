import express from 'express';
import * as foundationController from './foundationController';

const router = express.Router();

router.post('/', foundationController.createFoundationController);
router.get('/', foundationController.getFoundationsController);
router.get('/:id', foundationController.getFoundationByIdController);
router.put('/:id', foundationController.updateFoundationController);
router.delete('/:id', foundationController.deleteFoundationController);

export default router;