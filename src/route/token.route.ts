import { Router } from "express";
import { createToken } from "../controller/token.controller";

const tokenRouter = Router();

/**
 * @swagger
 * /api/v1/token/createTokens:
 *   get:
 *     summary: Create test tokens
 *     description: Deploys two test tokens (TokenA and TokenB) with predefined parameters.
 *     responses:
 *       201:
 *         description: Tokens created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Test token created: TokenA: <mint_address>-100000, TokenB: <mint_address>-1000000"
 */
tokenRouter.get("/createTokens", createToken);

export default tokenRouter;
