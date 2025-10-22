import express from "express";

//aquí van las rutas a definir (import { someRoute } from "./some-route"; por ejemplo)
import foundationRouters from "./foundations/foundation.routes";

const router = express.Router();

//rutas definidas aquí ( router.use("/some-path", someRoute); por ejemplo)
router.use("/foundations", foundationRouters);

export { router };