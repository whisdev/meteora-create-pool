import express, { Request, Response } from "express";
import cors from "cors";

import {
  corsOptions,
  helmetConfig,
  limiter,
  requestLogger,
} from "./middleware";
import { swaggerDocs } from "./config";

import ammRouter from "./route/amm.route";
import dlmmRouter from "./route/dlmm.route";
import tokenRouter from "./route/token.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmetConfig);

app.use(requestLogger);
app.use(limiter);

swaggerDocs(app);

app.use("/api/v1/amm", ammRouter);
app.use("/api/v1/dlmm", dlmmRouter);
app.use("/api/v1/token", tokenRouter);

app.get("/api", (_req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});

export default app;
