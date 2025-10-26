import express from "express";
import foundationRouters from "./foundations/foundation.routes";
import userRouters from "./users/user.routes";
import stripeRouters from "./stripe/stripe.routes";

const router = express.Router();

//FUNDACIONES
router.use("/foundations", foundationRouters);

//USUARIOS
router.use("/users", userRouters);

//STRIPE
router.use("/stripe", stripeRouters);

export { router };