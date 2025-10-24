import express from "express";

//aquí van las rutas a definir (import { someRoute } from "./some-route"; por ejemplo)
import foundationRouters from "./foundations/foundation.routes";
import userRouters from "./users/user.routes";

const router = express.Router();

//rutas definidas aquí ( router.use("/some-path", someRoute); por ejemplo)

//FUNDACIONES
router.use("/foundations", foundationRouters);

//USUARIOS
router.use("/users", userRouters);

export { router };