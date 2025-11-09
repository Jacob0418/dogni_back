require("dotenv").config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors"
import { router } from "./api/router";
import { BaseError } from "./shared/classes/base-error";
import { ErrorHandler, buildErrorMessage } from "./shared/classes/error-handler";
import { logger } from "./shared/classes/logger";
import { loggerFile } from "./shared/classes/error-file";
import { AuthenticationError } from "./shared/classes/api-errors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";


//Inicialización del servidor
const app = express();
const port = process.env.PORT || 8080;
const errorHandler = new ErrorHandler(logger);
// const errorFileHandler = new ErrorHandler(loggerFile);

const swaggerServerUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${port}/api`;

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Dogni API",
            version: "1.0.0",
            description: "Documentación API"
        },
        servers: [
            { url: swaggerServerUrl }
        ]
    },
    apis: [path.join(__dirname, "api", "**", "*.ts")]
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(bodyParser.json({
    limit: '70mb',
    verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
    }
}));
app.use(bodyParser.urlencoded({ limit: '70mb', extended: true }));
app.use("/api", router);
app.use(errorMiddleware);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, function () {
    console.log(`listening on http://localhost:${port}`);
});

// async function authenthicationMiddleWare(
//     err: unknown, req: express.Request, res: express.Response, next: express.NextFunction
// ) {
//     if (req.header['Authentication'] == 'Bearer Token') {
//         return;
//     }
//     next(new AuthenticationError("as"))
// }

async function errorMiddleware(err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) {
    if (err instanceof BaseError) {
        console.error('Error occurred:', err);
        res.status(err.httpCode).send(
            buildErrorMessage(err))
        return;
    }
    res.status(500).send(buildErrorMessage(err));
}
