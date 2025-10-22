import * as jwt from "jsonwebtoken";
import * as express from "express";

function checkAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const token = req.headers.authorization?.split(" ")[1] as string;
    const decodedToken = jwt.verify(token, process.env.JWT_KEY as string);
    next();
  } catch (error) {
    console.log(error);
    throw res.status(401).json({
      code: 401,
      message: "El token ingresado es inválido o ya está expirado",
    });
  }
}

function sign() {
  try {
    const token = jwt.sign("master", process.env.JWT_KEY as string);
    return;
  } catch (error) {
    console.log(error);
  }
}

export { checkAuth, sign };
