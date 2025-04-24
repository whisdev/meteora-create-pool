import { Router } from "express";
import { createDLMMPool } from "../controller/dlmm.controller";

const dlmmRouter = Router();

dlmmRouter.post("/create", createDLMMPool);

export default dlmmRouter;
