import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { logger } from "./logger";
import { env } from "./env";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Meteora API Documentation",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {},
    },
  },
  apis: ["./src/route/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info(`Swagger is running on https://${env.host}:${env.port}/api-docs`);
};
