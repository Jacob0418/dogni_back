import express from "express";
import foundationRouters from "./foundations/foundation.routes";
import userRouters from "./users/user.routes";
import stripeRouters from "./stripe/stripe.routes";
import aiRouters from './ai/ai.routes'
import certificateRouters from "./certificates/certificate.routes";

const router = express.Router();

//FUNDACIONES
router.use("/foundations", foundationRouters);

//USUARIOS
router.use("/users", userRouters);

//STRIPE
router.use("/stripe", stripeRouters);

router.use('/ai', aiRouters);

//CERTIFICADOS
router.use("/certificates", certificateRouters);

export { router };